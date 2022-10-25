import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Tag,
  Timeline,
  Button,
  Modal,
  Select,
  Form,
  Input,
  Breadcrumb,
} from "antd";
import {
  getCarSlots,
  createCarSlot,
  updateCarSlot,
} from "pages/api/carSlotApi";
import { useRouter } from "next/router";
import CarSlotDetail from "./CarSlotDetail";
import Image from "next/image";
import slot_active from "public/images/slot_active.gif";
import slot_available from "public/images/slot_available.png";
import slot_unavailable from "public/images/slot_unavailable.png";
import Loading from "components/Loading";
import moment from "moment";
import { openNotification } from "utils/notification";
import {
  UserOutlined,
  CarOutlined,
  FieldTimeOutlined,
  PlusOutlined,
  HomeOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const formatDate = "HH:mm";

const CarSlot = () => {
  const router = useRouter();
  const { carSlotId } = router.query;
  const [carSlots, setCarSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [form] = Form.useForm();

  const fetchCarSlots = async () => {
    setLoading(true);
    try {
      const response = await getCarSlots();
      setCarSlots(response.data.Data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      openNotification(err.response.data.message[0]);
    }
  };
  console.log("carSlots", carSlots);

  const convertStatusCarSlotImg = (status) => {
    switch (status) {
      case "UNAVAILABLE":
        return <Image height={220} width={220} src={slot_unavailable} />;
      case "AVAILABLE":
        return <Image height={220} width={220} src={slot_available} />;
      case "IN_USE":
        return <Image height={220} width={220} src={slot_active} />;
      default:
        break;
    }
  };

  const handleCreateCarSlot = async () => {
    try {
      const res = await createCarSlot();
      openNotification("Thành công", "Thêm mới vị trí thành công");
      fetchCarSlots();
    } catch (error) {
      openNotification(error.response.data.message[0]);
    }
  };

  useEffect(() => {
    fetchCarSlots();
  }, [carSlotId]);

  const renderByStatus = (status, carSlot) => {
    switch (status) {
      case "IN_USE":
        return (
          <div className="card-slot">
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                {convertStatusCarSlotImg(carSlot.status)}
              </div>
            </div>
            <div>
              <Timeline>
                <Timeline.Item dot={<UserOutlined />}>
                  {carSlot?.orderCustomerName}
                </Timeline.Item>
                <Timeline.Item>
                  {carSlot?.orderCustomerPhoneNumber}
                </Timeline.Item>
                <Timeline.Item dot={<CarOutlined />}>
                  {carSlot?.orderCarLicensePlate}
                </Timeline.Item>
                <Timeline.Item dot={<FieldTimeOutlined />}>
                  {moment(carSlot?.orderStartExecuting)
                    .add(carSlot?.orderTotalEstimateTime, "m")
                    .format(formatDate)}
                </Timeline.Item>
              </Timeline>
            </div>
          </div>
        );
      case "AVAILABLE":
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            {convertStatusCarSlotImg(carSlot.status)}
          </div>
        );
      case "UNAVAILABLE":
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            {convertStatusCarSlotImg(carSlot.status)}
          </div>
        );
      default:
        break;
    }
  };

  const onUpdateSlot = async (values) => {
    console.log("values", values);
    let dataUpdate = {
      name: values.name,
      status: values.status,
    };
    try {
      const res = await updateCarSlot(dataUpdate, form.getFieldValue("id"));
      openNotification("Thành công", "Cập nhật vị trí thành công");
      fetchCarSlots();
    } catch (error) {
      openNotification(error.response.data.message[0]);
    }

    setShowSetting(false);
  };

  const handleCss = (status) => {
    switch (status) {
      case "IN_USE":
        return {
          backgroundColor: "#002140",
          color: "white",
          height: "10px !important",
          textAlign: "center",
          height: "20px",
          justifyContent: "center",
          alignContent: "center",
          fontSize: "17px",
        };
      case "AVAILABLE":
        return {
          backgroundColor: "#004d00",
          color: "white",
          height: "35px",
          height: "20px",
          textAlign: "center",
          justifyContent: "center",
          alignContent: "center",
          fontSize: "17px",
        };
      case "UNAVAILABLE":
        return {
          backgroundColor: "#b38600",
          color: "white",
          height: "20px",
          textAlign: "center",
          justifyContent: "center",
          alignContent: "center",
          fontSize: "17px",
        };
    }
  };

  return (
    <>
      {carSlotId ? (
        <CarSlotDetail carSlotId={carSlotId} />
      ) : (
        <div className="site-card-border-less-wrapper">
          <Row style={{ paddingBottom: "10px" }}>
            <Col span={12}>
              <Breadcrumb style={{ margin: "5px", alignItems: "center" }}>
                <Breadcrumb.Item href="/admin">
                  <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <CarOutlined />
                  {" "} Quản lý vị trí chăm sóc xe
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
            <Col span={12}>
              <Button
                style={{ float: "right" }}
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => handleCreateCarSlot()}
              >
                Thêm vị trí mới
              </Button>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            {carSlots?.map((carSlot) => {
              return (
                <Col
                  key={carSlot.id}
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                  xl={6}
                  style={{ marginBottom: "10px" }}
                  onDoubleClick={() => {
                    if (carSlot.status === "UNAVAILABLE") {
                      openNotification("Vị trí này đang sửa chữa");
                    } else {
                      router.push(`/admin?carSlotId=${carSlot.carSlotCode}`);
                    }
                  }}
                >
                  <Card
                    headStyle={handleCss(carSlot.status)}
                    style={{
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      height: "270px",
                      padding: "0px",
                      border: "0.5px solid #002140",
                      boxShadow: " 4px 4px 4px -2px #ADBBF3",
                    }}
                    hoverable
                    title={carSlot.name}
                    bordered={false}
                    extra={
                      <SettingOutlined
                        onClick={() => {
                          setShowSetting(true);
                          form.setFieldsValue({
                            ...carSlot,
                          });
                        }}
                        style={{ color: "#FFFFFF", fontSize: "20px" }}
                        twoToneColor="#FFFFFF"
                      />
                    }
                  >
                    {renderByStatus(carSlot.status, carSlot)}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
      <Loading loading={loading} />
      <Modal
        visible={showSetting}
        onCancel={() => setShowSetting(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              onUpdateSlot(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
        width={700}
        okText="Xác nhận"
        cancelText="Hủy bỏ"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form form={form} layout="vertical" autoComplete="off">
              <Row gutter={16}>
                <Col span={18}>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    name="name"
                    label="Tên vị trí"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    name="status"
                    label="Trạng thái"
                  >
                    <Select
                      disabled={form.getFieldValue("status") === "IN_USE"}
                    >
                      <Select.Option disabled value="IN_USE">
                        Đang xử lý
                      </Select.Option>
                      <Select.Option value="AVAILABLE">
                        Đang trống
                      </Select.Option>
                      <Select.Option value="UNAVAILABLE">
                        Không khả dụng
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default CarSlot;
