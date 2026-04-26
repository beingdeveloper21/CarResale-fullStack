import { sendEmail } from "../configs/sendEmail.js";

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // 📧 Send confirmation mail
    try {
      await sendEmail({
        to: email,
        subject: "Subscribed to Car Resale Newsletter 🎉",
        html: `
          <h2>You're Subscribed! 🚀</h2>
          <p>Thank you for subscribing to our newsletter.</p>
          
          <p>You’ll now receive:</p>
          <ul>
            <li>🚗 Latest car listings</li>
            <li>💰 Best deals</li>
            <li>🔥 Exclusive updates</li>
          </ul>

          <br/>
          <p>Stay tuned! 👀</p>
        `,
      });
    } catch (error) {
      console.log("Newsletter email failed:", error.message);
    }

    res.json({ success: true, message: "Subscribed successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
