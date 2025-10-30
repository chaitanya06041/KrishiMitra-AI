import os
import sys
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

# Load .env variables
load_dotenv()

# --- Credentials ---
# These are loaded here for the initialize_twilio_client function
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
# This is loaded here as the send_twilio_sms function needs it
TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")


def initialize_twilio_client():
    """
    Initializes and returns a Twilio client object.
    Call this ONCE in your main application file.
    
    Returns:
        twilio.rest.Client: An authenticated Twilio client, or None if credentials fail.
    """
    # Check that credentials are loaded
    if not all([ACCOUNT_SID, AUTH_TOKEN]):
        print("Error: Twilio environment variables are missing.")
        print("Please check your .env file for: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN")
        return None
        
    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        print("Twilio client initialized successfully.")
        return client
    except Exception as e:
        print(f"Error initializing Twilio client: {e}")
        return None


def send_twilio_sms(client: Client, to_number: str, message_body: str):
    """
    Sends an SMS message using an existing Twilio client.
    
    Args:
        client (twilio.rest.Client): An already initialized Twilio client.
        to_number (str): The recipient's phone number in E.164 format (e.g., +918767397768).
        message_body (str): The text content of the message.
    """
    # Check that the FROM number is loaded
    if not TWILIO_NUMBER:
        print("Error: TWILIO_PHONE_NUMBER missing from .env file.")
        return
        
    # Check if a valid client was passed
    if client is None:
        print("Error: Invalid Twilio client object passed to send_twilio_sms.")
        print("Did you forget to call initialize_twilio_client()?")
        return
        
    try:
        print(f"Using provided Twilio client to send to {to_number}...")
        
        # Send the message using the provided client
        message = client.messages.create(
            body=message_body,
            from_=TWILIO_NUMBER,  # Your Twilio phone number
            to=to_number          # The recipient's phone number
        )
        
        # Print the response
        print("Message successfully sent!")
        print(f"  SID: {message.sid}")
        print(f"  Status: {message.status}")
        return message.sid

    except TwilioRestException as e:
        print("Error sending SMS via Twilio:")
        print(f"  Error Code: {e.code}")
        print(f"  Message: {e.msg}")
        if e.code == 21614: # "To" number is not a valid phone number
             print(f"\n---> HINT: Did you forget the '+' and country code? Number must be in E.164 format (e.g., +918767397768).")
        if e.code == 21211: # Invalid "To" phone number
             print(f"\n---> HINT: The number {to_number} is not valid. Check the format.")
        if e.code == 21612: # "To" number is not verified
             print(f"\n---> HINT: You are on a free trial and the number {to_number} is not verified.")
             print("Please go to your Twilio console and add it as a 'Verified Caller ID'.")
        return None

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

# --- Example of how to use this ---
if __name__ == "__main__":
    # This block runs ONLY when you execute this script directly
    # (e.g., python send_twilio_sms.py)
    # It will NOT run when you import the function into another file.
    
    print("Running SMS script directly for testing...")
    
    # 1. Initialize the client ONCE
    my_twilio_client = initialize_twilio_client()
    
    if my_twilio_client:
        # 2. Load the number to test with from .env
        MY_NUMBER = os.getenv("MY_VERIFIED_PHONE_NUMBER")
        
        if not MY_NUMBER:
            print("Error: MY_VERIFIED_PHONE_NUMBER not found in .env file for testing.")
            sys.exit(1)
            
        # 3. Call the send function as many times as you want
        # print("\n--- Sending Test Message 1 ---")
        # send_twilio_sms(my_twilio_client, MY_NUMBER, "Test message 1 for reusable client.")
        
        # print("\n--- Sending Test Message 2 ---")
        # send_twilio_sms(my_twilio_client, MY_NUMBER, "Test message 2. See? No new client needed!")
    
    else:
        print("Failed to initialize Twilio client. Exiting test.")

