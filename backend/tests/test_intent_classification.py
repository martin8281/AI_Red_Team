import unittest
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.ai.intent_classifier import IntentClassifier, MessageIntent


class TestIntentClassification(unittest.TestCase):

    def test_casual_intent_classification(self):
        """Test casual greetings, thanks, and small talk."""
        casual_messages = [
            "hi",
            "hello",
            "hey there!",
            "good morning",
            "thanks",
            "thank you very much!",
            "thx",
            "who are you",
            "what can you do?",
            "how are you doing?",
            "bye",
        ]
        for msg in casual_messages:
            intent = IntentClassifier.classify(msg)
            self.assertEqual(
                intent,
                MessageIntent.CASUAL,
                f"Expected CASUAL intent for message: '{msg}', got {intent}"
            )

    def test_clarifying_intent_classification(self):
        """Test clarifying step-by-step questions and triage guidance."""
        clarifying_messages = [
            "which log should I look at first?",
            "where do I start?",
            "how should I begin testing?",
            "what do you mean by that?",
            "can you walk me through the steps?",
            "what evidence do you need?",
            "where do I upload the log files?",
        ]
        for msg in clarifying_messages:
            intent = IntentClassifier.classify(msg)
            self.assertEqual(
                intent,
                MessageIntent.CLARIFYING,
                f"Expected CLARIFYING intent for message: '{msg}', got {intent}"
            )

    def test_full_assessment_intent_classification(self):
        """Test requests for comprehensive engagement assessment and reports."""
        full_assessment_messages = [
            "analyze this project",
            "give me the full risk assessment",
            "generate an engagement report",
            "provide a comprehensive audit of the project",
            "threat modeling review",
            "overall risk posture evaluation",
            "executive summary of the project",
        ]
        for msg in full_assessment_messages:
            intent = IntentClassifier.classify(msg)
            self.assertEqual(
                intent,
                MessageIntent.FULL_ASSESSMENT,
                f"Expected FULL_ASSESSMENT intent for message: '{msg}', got {intent}"
            )

    def test_specific_query_intent_classification(self):
        """Test specific targeted inquiries."""
        specific_messages = [
            "list the open findings",
            "show all findings",
            "what is the severity of finding #3",
            "explain this one vulnerability",
            "show me just the recommendations",
            "is api.apexfin.com in scope?",
            "what is CWE-89?",
            "show evidence for finding FND-101",
        ]
        for msg in specific_messages:
            intent = IntentClassifier.classify(msg)
            self.assertEqual(
                intent,
                MessageIntent.SPECIFIC_QUERY,
                f"Expected SPECIFIC_QUERY intent for message: '{msg}', got {intent}"
            )

    def test_quick_action_override(self):
        """Test that quick actions correctly override default text classification."""
        self.assertEqual(
            IntentClassifier.classify("anything", quick_action="summarize_project"),
            MessageIntent.FULL_ASSESSMENT
        )
        self.assertEqual(
            IntentClassifier.classify("anything", quick_action="suggest_remediation"),
            MessageIntent.SPECIFIC_QUERY
        )
        self.assertEqual(
            IntentClassifier.classify("anything", quick_action="explain_finding"),
            MessageIntent.SPECIFIC_QUERY
        )


if __name__ == "__main__":
    unittest.main()
