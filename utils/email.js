const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // 또는 다른 서비스
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, code) => {
  // ... (기존 코드와 동일)
};

const sendApplicationEmail = async (toEmail, errandTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: '[캠퍼스 퀵-헬퍼] 새로운 심부름 신청이 들어왔습니다!',
    html: `
      <h3>신청 알림</h3>
      <p>회원님이 등록하신 심부름 <strong>"${errandTitle}"</strong>에 새로운 헬퍼가 도움을 신청했습니다.</p>
      <p>마이페이지에서 신청자를 확인하고 수락해주세요!</p>
      <a href="${process.env.BASE_URL || 'http://localhost:3000'}/mypage" style="background:#3498db; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">마이페이지로 이동</a>
    `
  };
  return transporter.sendMail(mailOptions);
};

const sendMatchEmail = async (toEmail, errandTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: '[캠퍼스 퀵-헬퍼] 심부름 신청이 수락되었습니다!',
    html: `
      <h3>매칭 성공!</h3>
      <p>축하합니다! 신청하신 심부름 <strong>"${errandTitle}"</strong>의 요청자가 도움을 수락했습니다.</p>
      <p>지금 바로 요청자와 채팅을 시작해보세요.</p>
    `
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendApplicationEmail, sendMatchEmail };
