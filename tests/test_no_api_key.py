import os

def test_api_key_removed():
    """
    Test that the hardcoded API key has been removed from script.js.
    """
    with open('script.js', 'r') as f:
        content = f.read()
    assert 'apikey' not in content, "Error: Hardcoded API key found in script.js"

if __name__ == "__main__":
    test_api_key_removed()
    print("Test passed: Hardcoded API key is not present in script.js.")
