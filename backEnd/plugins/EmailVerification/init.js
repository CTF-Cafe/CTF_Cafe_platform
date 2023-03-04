exports.init = async function (api) {};

exports.registerEntrypoint = async function (api, req, res) {
  [req, res] = api.userController.register.verify(req, res);
  if (!checkEmail(req.body.email)) throw Error("Email is invalid!");
  [req, res] = api.userController.register.manipulate(req, res);

  const message = `Verify your email : ${process.env.BACKEND_URI}/api/verify/${user._id}/${user.token}`;
  await sendEmail(user.email, "Verify Email CTF", message);

  res.message = {
    state: "success",
    message: "Registered! Now verify email!",
  };

  return req, res;
};

function checkEmail(email) {
  if (
    !email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  ) {
    return false;
  }
  return true;
}

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    });
  } catch (error) {
    throw Error("Sending email failed!");
  }
};

async function verifyMail(req, res) {
  try {
    const user = await users.findOne({ _id: req.params.id });
    if (!user) throw new Error("Invalid Link");

    if (user.token != req.params.token) throw new Error("Invalid Link");

    await users.updateOne({ _id: user._id }, { verified: true, token: "" });

    res.send("Email verified!");
  } catch (err) {
    if (err) {
      res.send(err.message);
    }
  }
}
