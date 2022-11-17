import {
  BarChartOutlined,
  UserOutlined,
  TagsOutlined,
  DollarOutlined,
  ShopOutlined,
  CarOutlined,
  BookOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Typography, Affix } from "antd";
import React, { useState, useEffect } from "react";
const { Title } = Typography;
import { useRouter } from "next/router";
import logo from "public/images/logo-sibar.png";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const SideBar = ({ handleOpenKey }) => {
  const router = useRouter();
  const [items, setItems] = useState([]);

  const onClick = ({ item, key, keyPath, domEvent }) => {
    console.log({ item, key, keyPath, domEvent });
    router.push("/admin");
    handleOpenKey(key);
  };

  const roles = Cookies.get("roles");
  const handleRole = (roles) => {
    if (roles === "ROLE_ADMIN") {
      setItems([
        getItem("Đơn hàng", "1", <ShopOutlined />, [
          getItem("Yêu cầu xử lý", "order"),
          getItem("Vị trí xử lý", "car-slot"),
          getItem("Danh sách đơn hàng", "order-not-request"),
        ]),
        getItem("Hóa đơn", "2", <BookOutlined />, [
          getItem("Hóa đơn", "bills"),
          // getItem("Hóa đơn hủy", "bills"),
        ]),
        getItem("Dịch vụ", "3", <ClearOutlined />, [
          getItem("Dịch vụ", "service"),
          getItem("Danh mục", "category"),
          getItem("Bảng giá", "price"),
        ]),
        getItem("Xe", "4", <CarOutlined />, [
          getItem("Xe khách hàng", "car"),
          getItem("Mẫu xe", "car-model"),
        ]),
        getItem("Người dùng", "5", <UserOutlined />, [
          getItem("Nhân viên", "user"),
          getItem("Khách hàng", "customer"),
        ]),
        getItem("Khuyến mãi", "6", <TagsOutlined />, [
          getItem("Khuyến mãi", "promotion"),
        ]),
        getItem("Thống kê - Báo cáo", "7", <BarChartOutlined />, [
          getItem("Thống kê", "statistic"),
          getItem("Báo cáo", "report"),
        ]),
      ]);
    } else {
      setItems([
        getItem("Đơn hàng", "1", <ShopOutlined />, [
          getItem("Yêu cầu xử lý", "order"),
          getItem("Vị trí xử lý", "car-slot"),
          getItem("Danh sách đơn hàng", "order-not-request"),
        ]),
        getItem("Hóa đơn", "2", <BookOutlined />, [
          getItem("Hóa đơn", "bills"),
        ]),
        getItem("Dịch vụ", "3", <ClearOutlined />, [
          getItem("Dịch vụ", "service"),
          getItem("Danh mục", "category"),
          getItem("Bảng giá", "price"),
        ]),
      
        getItem("Xe", "4", <CarOutlined />, [
          getItem("Xe khách hàng", "car"),
          getItem("Mẫu xe", "car-model"),
        ]),
        getItem("Người dùng", "5", <UserOutlined />, [
          getItem("Khách hàng", "customer"),
        ]),
        getItem("Khuyến mãi", "5", <TagsOutlined />, [
          getItem("Khuyến mãi", "promotion"),
        ]),
        getItem("Thống kê - Báo cáo", "7", <BarChartOutlined />, [
          getItem("Thống kê", "statistic"),
          getItem("Báo cáo", "report"),
        ]),
      ]);
    }
  };

  useEffect(() => {
    handleRole(roles);
  }, [roles]);

  const rootSubmenuKeys = ['1', '2', '3','4','5','6','7'];
  const [openKeys, setOpenKeys] = useState(['car-slot']);
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  return (
    <div style={{ height: "100%" }}>
      <div className="logo" style={{ textAlign: "center" }}>
        <Link href="/admin">
          <Image
            style={{ alignItems: "center" }}
            width={75}
            height={75}
            src={logo}
            alt="VLCARSERVICE"
          />
        </Link>
      </div>
      <Menu
        mode="inline"
        theme="dark"
        openKeys={openKeys}
        style={{ height: "100%" }}
        onOpenChange={onOpenChange}
        items={items}
        onClick={onClick}
        // defaultSelectedKeys={["car-slot"]}
      />
    </div>
  );
};

export default SideBar;
