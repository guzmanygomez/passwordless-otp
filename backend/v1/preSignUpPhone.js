import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "ap-southeast-2" });

// Simple random 6-digit code generator
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const handler = async (event) => {
  console.log("Pre Sign-Up event:", JSON.stringify(event));

  const phone = event.request.userAttributes.phone_number;

  // ✅ Auto-confirm the user
  event.response.autoConfirmUser = true;

  if (phone) {
    event.response.autoVerifyPhone = true;

    // ✅ Generate and send a code
    const code = generateCode();
    const message = `Your verification code is: ${code}`;

    const params = {
      Message: message,
      PhoneNumber: phone,
    };

    try {
      await snsClient.send(new PublishCommand(params));
      console.log("✅ Verification code sent to:", phone);
    } catch (err) {
      console.error("❌ Failed to send verification code:", err);
    }

    // You can optionally store the code somewhere (e.g., DynamoDB) to verify later
    // This is needed if you want to verify the code yourself after sign-up
  }

  if (event.request.userAttributes.email) {
    event.response.autoVerifyEmail = true;
  }

  return event;
};
