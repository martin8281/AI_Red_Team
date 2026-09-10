import unittest
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.ai.session_store import SessionContextStore


class TestSessionMemory(unittest.TestCase):

    def test_file_persistence_across_turns(self):
        """Test that files uploaded in turn 1 persist across subsequent turns in the same session."""
        conv_id = "conv-test-memory-01"
        project_id = "PRJ-MEMORY-01"

        # Turn 1: User uploads auth.log
        turn1_attachments = [
            {
                "id": "att-auth-1",
                "name": "auth.log",
                "category": "LOG",
                "contentSnippet": "2026-09-08T10:00:00Z 198.51.100.44 admin FAILED_LOGIN\n2026-09-08T10:01:00Z 198.51.100.44 admin FAILED_LOGIN",
                "size": 120
            }
        ]
        session = SessionContextStore.register_turn(
            conversation_id=conv_id,
            project_id=project_id,
            user_message="Here is the authentication log for triage.",
            attachments=turn1_attachments
        )

        self.assertEqual(len(session.uploaded_files), 1)
        self.assertIn("att-auth-1", session.uploaded_files)
        self.assertGreaterEqual(len(session.all_log_records), 2)

        # Turn 2: User asks a conversational question without attaching files
        SessionContextStore.register_turn(
            conversation_id=conv_id,
            project_id=project_id,
            user_message="What did you find in those logs?",
            attachments=None
        )

        # Turn 3: User uploads firewall.log 10 messages later
        turn3_attachments = [
            {
                "id": "att-fw-1",
                "name": "firewall.log",
                "category": "LOG",
                "contentSnippet": "2026-09-08T10:05:00Z 198.51.100.44 ALLOW 443\n2026-09-08T10:06:00Z 198.51.100.44 ALLOW 8080",
                "size": 95
            }
        ]
        updated_session = SessionContextStore.register_turn(
            conversation_id=conv_id,
            project_id=project_id,
            user_message="Now compare this firewall log with the auth log from earlier.",
            attachments=turn3_attachments
        )

        # Both files must be preserved in session memory
        self.assertEqual(len(updated_session.uploaded_files), 2)
        self.assertIn("att-auth-1", updated_session.uploaded_files)
        self.assertIn("att-fw-1", updated_session.uploaded_files)

        # Check that context prompt includes BOTH files
        context_prompt = SessionContextStore.build_session_context_prompt(conv_id)
        self.assertIn("auth.log", context_prompt)
        self.assertIn("firewall.log", context_prompt)

    def test_fact_extraction_and_persistence(self):
        """Test extracting and persisting user-stated constraints and facts."""
        conv_id = "conv-test-facts-01"
        project_id = "PRJ-FACTS-01"

        # User states a scope constraint and an exclusion rule
        SessionContextStore.register_turn(
            conversation_id=conv_id,
            project_id=project_id,
            user_message="Please note: scope is only auth.apexfin.com and api.apexfin.com. Also, ignore staging server errors."
        )

        session = SessionContextStore.get_or_create(conv_id, project_id)
        self.assertGreaterEqual(len(session.stated_facts), 1)

        context_prompt = SessionContextStore.build_session_context_prompt(conv_id)
        self.assertIn("USER-STATED SESSION CONSTRAINTS", context_prompt)
        self.assertIn("Scope Constraint", context_prompt)


if __name__ == "__main__":
    unittest.main()
