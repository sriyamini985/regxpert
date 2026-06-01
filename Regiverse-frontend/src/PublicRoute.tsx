import React from "react";

type PublicRouteProps = {
  children: React.ReactNode;
};

export default function PublicRoute({
  children,
}: PublicRouteProps) {
  return <>{children}</>;
}