export async function sendPasswordResetCode(
  to: string,
  code: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM ?? "CatCal <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "CatCal password reset code",
        html: `<p>Your CatCal password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p><p>This code expires in 15 minutes. If you did not request this, you can ignore this email.</p>`,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Password reset email failed:", error);
    return false;
  }
}
