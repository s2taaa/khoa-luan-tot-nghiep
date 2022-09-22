import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Divider, InputNumber, Typography } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import { Form, Input, Button, Col, Row, message, Modal, Steps } from "antd";
import { useRouter } from "next/router";
import Link from "next/link";
import Loading from "components/Loading";
import { auth } from "config/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { changePassword, checkExistPhone } from "api/authAPI";
import OtpInput from "react-otp-input";
const { Title } = Typography;


export default function ForgotPassword() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(false);
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const router = useRouter();

  const getOtp = async (values) => {
    // console.log(values);
    setPhoneNumber(values.phone);
    console.log(phoneNumber);
    const checkExist = await checkExistPhone(values.phone).then((res) => {
      return res.data;
    });
    console.log("checkExist:", checkExist);
    if (checkExist.data === false) {
      message.error("Số điện thoại chưa được đăng ký");
      return;
    }
    const number = "+84" + values.phone;
    console.log("number:", number);
    try {
      const response = await setUpRecaptha(number);
      message.success("Mã OTP đã được gửi đến số điện thoại của bạn");
      setResult(response);
      setFlag(true);
      setStep(1);
    } catch (err) {
      message.error(err.message);
    }
  };

  function setUpRecaptha(number) {
    // const recaptchaVerifier = new RecaptchaVerifier(
    //   "recaptcha-container",
    //   {},
    //   auth
    // );
    const recaptchaVerifier = new RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // onSignInSubmit();
        },
      },
      auth
    );
    recaptchaVerifier.render();
    return signInWithPhoneNumber(auth, number, recaptchaVerifier);
  }

  const verifyOtp = async (e) => {
    console.log(result);
    if (result === null || result === "") {
      message.error("Vui lòng nhập số điện thoại ở bước 1");
      return;
    }
    try {
      await result.confirm(otp);
      setStep(2);
      message.success("Xác thực thành công!");
    } catch (err) {
      message.error("Mã OTP chưa chính xác");
    }
  };

  const handleChangePassword = async (values) => {
    const changePasswordRequets = {
      username: phoneNumber,
      newPassword: values.password,
    };
    console.log(changePasswordRequets);
    try {
      changePassword(changePasswordRequets).then((res) => {
        console.log(res);
        if (res.data.StatusCode == 200) {
          message.success("Change password success!");
          success();
          // router.push("/login");
        } else {
          message.error(res.data.message);
        }
      });
    } catch (err) {
      message.error(err.message);
    }
  };

  function success() {
    Modal.success({
      content: "Cập nhật tài khoản thành công !",
      onOk: () => {
        router.push("/login");
      },
      onCancel: () => {
        router.push("/login");
      },
    });
  }
  const onChange = (value) => {
    if (value != 0) return;
    console.log("onChange:", step);
    setStep(value);
  };
  return (
    <>
      <Row
        justify="space-around"
        align="middle"
        style={{
          height: "100vh",

          textAlign: "center",
        }}
      >
        <Col
          span={18}
          xs={18}
          sm={18}
          md={18}
          lg={10}
          style={{
            backgroundColor: "#DFE9F8",
            padding: "50px",
            borderRadius: "10px",
          }}
        >
          <Title level={2} style={{ marginBottom: "20px" }}>
            Lấy lại mật khẩu
          </Title>
         

          {step == 0 && (
            <Form
              name="basic"
              labelCol={{ span: 6 }}
              labelAlign="left"
              size={"middle"}
              wrapperCol={{ span: 18 }}
              onFinish={getOtp}
            >
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  {
                    pattern: new RegExp("^(84|0[3|5|7|8|9])+([0-9]{8})$"),
                    required: true,
                    message:
                      "Số điện thoại không hợp lệ! Số điện thoại bao gồm 10 ký tự số bắt đầu là 84 hoặc 03, 05, 07, 08, 09",
                  },
                ]}
              >
                <Input  prefix={<PhoneOutlined className="site-form-item-icon" />}
                  placeholder="Nhập số điện thoại"
                  // maxLength={10}
                  minLength={10}
                />
                {/* <CountryPhoneInput  short='VN'  placeholder="Nhập số điện thoại" /> */}
                {/* <ReactPhoneInput
          
                containerStyle={{ width: "100%" }}
                searchClass="search-class"
                searchStyle={{
                  margin: "0px",

                  width: "96%",
                  height: "30px"
                }}
                enableSearchField
                disableSearchIcon
              /> */}
              </Form.Item>
              <div id="recaptcha-container"></div>

              <Button
                id="sign-in-button"
                className="btn-login"
                type="primary
                            "
                htmlType="submit"
              >
                Gửi mã OTP
              </Button>
            </Form>
          )}
          {step === 1 && (
            <Form
              name="basic"
              labelCol={{ span: 6 }}
              labelAlign="left"
              size={"middle"}
              wrapperCol={{ span: 18 }}
              onFinish={verifyOtp}
            >
              <Form.Item
                label="Mã OTP"
                name="otp"
                rules={[
                  {
                    required: true,
                    message: "Mã OTP không được để trống!",
                  },
                ]}
              >
                {/* <Input
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập vào mã OTP"
                /> */}

                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  inputStyle = {{
                    width: "3rem",
                    height: "3rem",
                    marginRight: "0.4rem",
                    borderRadius: 4,
                    border: "1px solid rgba(0,0,0,.15)"
                  }}
    
                  numInputs={6}
                />
              </Form.Item>

              <Button
                className="btn-login"
                type="primary
                            "
                htmlType="submit"
              >
                Xác nhận
              </Button>
            </Form>
          )}
          {step === 2 && (
            <Form
              name="basic"
              labelCol={{ span: 6 }}
              labelAlign="left"
              size={"middle"}
              wrapperCol={{ span: 18 }}
              onFinish={handleChangePassword}
            >
              <Form.Item
                label="Mật khẩu mới"
                name="password"
                rules={[
                  {
                  pattern: new RegExp(
                    "^([0-9a-zA-Z]*[.!@$%^&(){}[]:;<>,.?/~_+-=|]*).{6,32}$"
                  ),
                  required: true,
                  message:
                    "Mật khẩu không hợp lệ! Mật khẩu bao gồm 6-32 ký tự bao gồm chữ, số và ký tự đặc biệt",
                },
                ]}
              >
                <Input.Password placeholder="Nhập vào mật khẩu mới" />
              </Form.Item>
              <Form.Item
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                rules={[
                  {
                    pattern: new RegExp(
                      "^([0-9a-zA-Z]*[.!@$%^&(){}[]:;<>,.?/~_+-=|]*).{6,32}$"
                    ),
                    required: true,
                    message:
                      "Mật khẩu không hợp lệ! Mật khẩu bao gồm 6-32 ký tự bao gồm chữ, số và ký tự đặc biệt",
                  },
                ]}
              >
                <Input.Password placeholder="Nhập vào mật khẩu mới" />
              </Form.Item>

              <Button
                className="btn-login"
                type="primary
                            "
                htmlType="submit"
              >
                Xác nhận
              </Button>
            </Form>
          )}
           <Divider />
          <Steps current={step} onChange={onChange}>
            <Steps.Step title="Nhập số điện thoại" />
            <Steps.Step title="Xác thực OTP" />
            <Steps.Step title="Đổi mật khẩu" />
          </Steps>
        
          <Divider/>
          <p className="text-center">
            Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
          </p>
          Đăng ký tài khoản mới?<Link href="/forgot-password"> Đăng ký</Link>
        </Col>
      </Row>
    </>
  );
}