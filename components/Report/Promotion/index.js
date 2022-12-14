import React, { useState, useEffect } from "react";
import {
  Breadcrumb,
  Col,
  Row,
  Select,
  Form,
  DatePicker,
  Button,
  Typography,
  Table,
} from "antd";
import {
  ExportOutlined,
  HomeOutlined,
  FileExcelOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { getReport, getPromotionReport } from "pages/api/reportAPI";
import { getPromotionHeaders } from "pages/api/promotionHeaderAPI";
import { getCustomers } from "pages/api/customerAPI";
import { getUsers } from "pages/api/userAPI";
import Loading from "components/Loading";
import { formatMoney } from "utils/format";
import { openNotification, openNotificationWarning } from "utils/notification";
const { RangePicker } = DatePicker;

const dateFormat = "DD/MM/YYYY";

const ReportPromotion = () => {
  const [form] = Form.useForm();
  const [typeDate, setTypeDate] = useState("d");
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [promotion, setPromotion] = useState([]);
  const [status, setStatus] = useState(100);
  const [loading, setLoading] = useState(false);
  const [dataSaleReport, setDataSaleReport] = useState([]);
  const [dataSaleReportCustomer, setDataSaleReportCustomer] = useState([]);
  // const [fromDate, setFromDate] = useState(moment());
  // const [toDate, setToDate] = useState(moment());

  const handleFetchPromotion = async () => {
    try {
      const res = await getPromotionHeaders();
      setPromotion(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeTypeDate = (value) => {
    setTypeDate(value);
    handleDatePicker();
  };

  const handleDatePicker = () => {
    switch (typeDate) {
      case "d":
        return (
          <RangePicker
            disabledDate={(d) => !d || d.isAfter(moment())}
            format={dateFormat}
          />
        );
      case "m":
        return (
          <RangePicker
            disabledDate={(d) => !d || d.isAfter(moment())}
            picker="month"
          />
        );
      case "y":
        return (
          <RangePicker
            disabledDate={(d) => !d || d.isAfter(moment())}
            picker="year"
          />
        );
    }
  };

  const handleExportExcel = async (values) => {
    if (dataSaleReport.length === 0) {
      openNotificationWarning("Kh??ng c?? d??? li???u ????? xu???t file");
      return;
    }
    openNotification("??ang xu???t file excel");
    let fromDate;
    let toDate;
    if (values.typeDate === "d") {
      fromDate = values.rangerDate[0];
      toDate = values.rangerDate[1];
    }
    if (values.typeDate === "m") {
      fromDate = moment(values.rangerDate[0]).startOf("month").add(1, "days");
      toDate = moment(values.rangerDate[1]).endOf("month");
    }
    if (values.typeDate === "y") {
      fromDate = moment(values.rangerDate[0]).startOf("year").add(1, "days");
      toDate = moment(values.rangerDate[1]).endOf("year");
    }

    setLoading(true);
    let body = {
      promotionType: values.promotionType,
      promotionHeaderId: values.promotionHeaderId,
      reportType: 4,
      fromDate: fromDate,
      toDate: toDate,
    };
    try {
      const response = await getReport(body);
      setLoading(false);
    } catch (error) {
      openNotificationWarning("C?? l???i x???y ra, vui l??ng th??? l???i sau");
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    let fromDate;
    let toDate;
    if (values.typeDate === "d") {
      fromDate = values.rangerDate[0];
      toDate = values.rangerDate[1];
    }
    if (values.typeDate === "m") {
      fromDate = moment(values.rangerDate[0]).startOf("month").add(1, "days");
      toDate = moment(values.rangerDate[1]).endOf("month");
    }
    if (values.typeDate === "y") {
      fromDate = moment(values.rangerDate[0]).startOf("year").add(1, "days");
      toDate = moment(values.rangerDate[1]).endOf("year");
    }

    let body = {
      promotionType: values.promotionType,
      promotionHeaderId: values.promotionHeaderId,
      fromDate: fromDate,
      toDate: toDate,
    };
    try {
      const res = await getPromotionReport(body);
      setDataSaleReport(res.data.Data);
      setLoading(false);
    } catch (error) {
      openNotificationWarning("C?? l???i x???y ra, vui l??ng th??? l???i sau");
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchPromotion();
  }, []);

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 70,
      render: (text, record, dataIndex) => {
        return <div>{dataIndex + 1}</div>;
      },
    },
    {
      title: "M?? khuy???n m??i",
      dataIndex: "promotionDetailCode",
      key: "promotionDetailCode",
    },
    {
      title: "T??n khuy???n m??i",
      dataIndex: "promotionDetailName",
      key: "promotionDetailName",
    },
    {
      title: "Ng??y b???t ?????u",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (text, record) => {
        return <div>{moment(record.fromDate).format(dateFormat)}</div>;
      },
    },
    {
      title: "Ng??y k???t th??c",
      dataIndex: "toDate",
      key: "toDate",
      render: (text, record) => {
        return <div>{moment(record.toDate).format(dateFormat)}</div>;
      },
    },
    {
      title: "Lo???i khuy???n m??i",
      dataIndex: "promotionType",
      key: "promotionType",
    },
    {
      title: "M?? d???ch v???",
      dataIndex: "serviceCode",
      key: "serviceCode",
    },
    {
      title: "T??n d???ch v???",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "S??? ti???n khuy???n m??i",
      dataIndex: "promotionAmount",
      key: "promotionAmount",
      render: (text, record) => {
        return (
          <div>
            {record.promotionType === "Gi???m theo %"
              ? record.promotionAmount + "%"
              : formatMoney(record.promotionAmount)}
          </div>
        );
      },
    },
    {
      title: "Gi???i h???n ng??n s??ch",
      dataIndex: "limitUsedTime",
      key: "limitUsedTime",
    },
    {
      title: "Ng??n s??ch t???ng",
      dataIndex: "limitPromotionAmount",
      key: "limitPromotionAmount",
      render: (text, record) => {
        return <div>{formatMoney(record.limitPromotionAmount || 0)}</div>;
      },
    },
    {
      title: "Ng??n s??ch c??n l???i",
      dataIndex: "limitPromotionAmountLeft",
      key: "limitPromotionAmountLeft",
      render: (text, record) => {
        return <div>{formatMoney(record.limitPromotionAmountLeft || 0)}</div>;
      },
    },

    {
      title: "Ng??n s??ch ???? s??? d???ng",
      dataIndex: "promotionUsedAmount",
      key: "promotionUsedAmount",
      render: (text, record) => {
        return <div>{formatMoney(record.promotionUsedAmount)}</div>;
      },
    },
  ];

  return (
    <>
      <Breadcrumb style={{ margin: "5px", alignItems: "center" }}>
        <Breadcrumb.Item href="/admin">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="">B??o c??o khuy???n m??i</Breadcrumb.Item>
      </Breadcrumb>

      <Form form={form} autoComplete="off">
        <Row style={{ padding: "0 5rem 0 5rem" }} gutter={[16]}>
          <Col span={24}>
            <Typography.Title level={2} className="content-center">
              B??o c??o khuy???n m??i
            </Typography.Title>
          </Col>

          <Col span={3}>
            <Form.Item
              rules={[
                {
                  required: true,
                },
              ]}
              name="typeDate"
              initialValue="d"
            >
              <Select
                onChange={onChangeTypeDate}
                value={typeDate}
                style={{ width: "100%" }}
              >
                <Select.Option value="d">Ng??y</Select.Option>
                <Select.Option value="m">Th??ng</Select.Option>
                <Select.Option value="y">N??m</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              rules={[
                {
                  required: true,
                },
              ]}
              name="rangerDate"
              initialValue={[moment(moment().subtract(7, "days")), moment()]}
            >
              {handleDatePicker()}
            </Form.Item>
          </Col>

          <Col span={7}>
            <Form.Item name="promotionType">
              <Select placeholder="Lo???i khuy???n m??i">
                <Select.Option value="MONEY">Gi???m ti???n</Select.Option>
                <Select.Option value="PERCENTAGE">
                  Gi???m ti???n theo %
                </Select.Option>
                <Select.Option value="SERVICE">Gi???m ti???n d???ch v???</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={1}>
            <Button
              icon={<ClearOutlined />}
              style={{ width: "100%" }}
              onClick={() => {
                form.setFieldsValue({
                  promotionHeaderId: undefined,
                });
              }}
              type="dashed"
            ></Button>
          </Col>
          <Col span={3}>
            <Button
              style={{ width: "100%" }}
              onClick={() => {
                form
                  .validateFields()
                  .then((values) => {
                    onFinish(values);
                  })
                  .catch((info) => {
                    console.log("Validate Failed:", info);
                  });
              }}
              type="dashed"
            >
              Th???ng k??
            </Button>
          </Col>
          <Col span={4}>
            <Button
              style={{ width: "100%" }}
              onClick={() => {
                form
                  .validateFields()
                  .then((values) => {
                    handleExportExcel(values);
                  })
                  .catch((info) => {
                    console.log("Validate Failed:", info);
                  });
              }}
              icon={<FileExcelOutlined />}
              type="primary"
            >
              Xu???t b??o c??o
            </Button>
          </Col>
          <Col span={24}>
            <Form.Item name="promotionHeaderId">
              <Select
                style={{ width: "100%" }}
                showSearch
                placeholder="Ch????ng tr??nh khuy???n m??i"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.includes(input)
                }
                filterSort={(optionA, optionB) =>
                  optionA.children
                    .toLowerCase()
                    .localeCompare(optionB.children.toLowerCase())
                }
              >
                {promotion.map((item) => (
                  <Option value={item.id}>
                    {item?.promotionHeaderCode + " - " + item?.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              bordered
              columns={columns}
              dataSource={dataSaleReport}
              scroll={{
                y: 280,
              }}
              pagination={{
                pageSize: 20,
              }}
            />
          </Col>
        </Row>
      </Form>
      <Loading loading={loading} />
    </>
  );
};
export default ReportPromotion;
