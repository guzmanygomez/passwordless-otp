export const handler = async (event) => {
    console.log("Pre Sign-Up event:", JSON.stringify(event));
  
    // ✅ Auto-confirm the user
    event.response.autoConfirmUser = true;
  
    // ✅ Auto-verify phone number if provided
    if (event.request.userAttributes.phone_number) {
      event.response.autoVerifyPhone = true;
    }
  
    // ✅ Optional: auto-verify email
    if (event.request.userAttributes.email) {
      event.response.autoVerifyEmail = true;
    }
  
    return event;
  };