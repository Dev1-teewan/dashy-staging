"use client";

import React from "react";
import { redirect } from "next/navigation";
import { Button, Divider, Dropdown, Input } from "antd";

export function ConnectDropdown({}) {
  const setURL = async (formData: FormData) => {
    redirect(`?watching=${formData.get("address")}`);
  };

  return (
    <Dropdown
      placement="bottomRight"
      trigger={["click"]}
      dropdownRender={() => (
        <form action={setURL} className="mt-2 p-2 rounded-xl bg-[#202020] w-56">
          <Input name="address" placeholder="Sol Address" />
          <Divider style={{ margin: 0 }} />
          <div className="mt-2 w-full">
            <Button className="custom-button !w-full" htmlType="submit">
              Watch New Wallet
            </Button>
          </div>
        </form>
      )}
    >
      <Button className="custom-button">
        <span>Connect</span>
      </Button>
    </Dropdown>
  );
}
