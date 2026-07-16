"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Search, SearchFill,
  DirectionsCar, DirectionsCarFill,
  Chat, ChatFill,
  Person, PersonFill,
} from "@material-symbols-svg/react";

import { Icon } from "@/components/atoms/presentation";
import { css } from "@/styled-system/css";

const kiwidiGreen = "#547812";
const inactiveGray = "#8c8c8c";

export default function Sidebar() {
  const pathname = usePathname() || "";

  const checkIsActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const items = [
    {
      href: "/dashboard",
      label: "Buscar Caronas",
      isActive: checkIsActive("/dashboard"),
      icon: checkIsActive("/dashboard") ? <SearchFill /> : <Search />,
    },
    {
      href: "/runs",
      label: "Minhas Caronas",
      isActive: checkIsActive("/runs"),
      icon: checkIsActive("/runs") ? <DirectionsCarFill /> : <DirectionsCar />,
    },
    {
      href: "/chat",
      label: "Chat",
      isActive: checkIsActive("/chat"),
      icon: checkIsActive("/chat") ? <ChatFill /> : <Chat />,
    },
    {
      href: "/profile",
      label: "Perfil",
      isActive: checkIsActive("/profile"),
      icon: checkIsActive("/profile") ? <PersonFill /> : <Person />,
    },
  ];

  return (
    <div className={css({ display: "flex", flexDirection: "column", width: "100%", gap: "6" })}>
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "3",
          paddingBottom: "5",
          borderBottom: "1px solid",
          borderColor: "rgba(255, 255, 255, 0.1)",
        })}
      >
        <Image src="/logo.webp" alt="RaijMobi" width={36} height={36} />
        <div className={css({ display: "flex", flexDirection: "column", minWidth: "0" })}>
          <span className={css({ color: "white", fontWeight: "bold", fontSize: "md", lineHeight: "1.2" })}>
            RaijMobi
          </span>
          <span className={css({ color: "gray.400", fontSize: "xs" })}>
            Caronas inteligentes
          </span>
        </div>
      </div>

      <ul className={css({ display: "flex", flexDirection: "column", gap: "1", width: "100%" })}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "3",
                paddingY: "3",
                paddingLeft: "3",
                paddingRight: "4",
                borderRadius: "md",
                borderLeftWidth: "3px",
                borderLeftStyle: "solid",
                textDecoration: "none",
                transition: "all 0.15s ease",
                _hover: { backgroundColor: "rgba(255, 255, 255, 0.06)" },
              })}
              style={{
                borderLeftColor: item.isActive ? kiwidiGreen : "transparent",
                backgroundColor: item.isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                color: item.isActive ? kiwidiGreen : inactiveGray,
              }}
            >
              <Icon size="md">{item.icon}</Icon>
              <span
                className={css({ fontSize: "sm" })}
                style={{ fontWeight: item.isActive ? 700 : 500 }}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
