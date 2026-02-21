const axios = require('axios')
const verifyCaptchaV2 = async (token) => {
    const enableCaptcha = !!process.env.CAPTCHA_SECRET_KEY
    if (!enableCaptcha) return { success: true, message: "" }
    const googleURL = "https://www.google.com/recaptcha/api/siteverify";
    const secretKey = process.env.CAPTCHA_SECRET_KEY;
    if (!secretKey) return {
        success: true,
        message: "Skip reECAPTCHA mechanism"
    };


    const response = await axios.post(
        googleURL,
        {},
        {
            params: {
                secret: secretKey,
                response: token,
            },
        }
    );

    const data = response.data;
    if (!data.success) {
        return {
            success: false,
            message: "CAPTCHA VALIDATION FAILED"
        }
    }
    return {
        success: true,
        message: ""
    }
}

module.exports = {
    verifyCaptchaV2
}