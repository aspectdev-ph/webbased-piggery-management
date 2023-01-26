"use client";
import { useEffect, useState } from "react";
import SkeletonLoader from "../Loading/skeletonLoader";
import Image from "next/image";
import Link from "next/link";
interface User {
  user_id: number;
  username: string;
  password: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  job: string;
  is_exist: string;
}

interface ApiData {
  code: number;
  data: User[];
}

export default function Page() {
  const [userData, setUserData] = useState<ApiData>();
  const [parsed, setParsed] = useState<User[]>([]);
  console.log(parsed);
  useEffect(() => {
    const getUserInfo = async () => {
      let headersList = {
        Accept: "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      };

      let response = await fetch("http://localhost:3000/api/get/getUsers", {
        method: "GET",
        headers: headersList,
      });
      const data = await response.json();
      if (response.ok) {
        setTimeout(() => {
          setUserData(data);
          setParsed(data.data);
        }, 5000);
      }
    };

    getUserInfo();
  }, []);

  if (parsed.length == 0) {
    return (
      <>
        <tr>
          <td colSpan={6} className="text-base font-bold">
            <div className="flex flex-row w-full text-center">
              <span className="ml-auto mr-0">
                Please wait while we get user data
              </span>
              <div className="h-6 ml-2 mr-auto animate-spin w-6 rounded-full border-b-4 border-l-4 border-slate-400"></div>
            </div>
          </td>
        </tr>
      </>
    );
  } else {
    return (
      <>
        {parsed.map((user: User, index: number) => (
          <tr
            className={`h-auto lg:table-row block bg-slate-300 rounded-md my-2 py-4 ${
              index % 2 == 0 ? "bg-slate-200" : "bg-slate-400"
            }`}
            key={index}
          >
            <td className="block lg:table-cell flex lg:flex-none flex-row">
              <p className="lg:hidden ml-4 w-1/4 font-bold">Username:</p>
              <p className="break-words">{user.username}</p>
            </td>
            <td className="block lg:table-cell flex lg:flex-none flex-row">
              <p className="lg:hidden ml-4 w-1/4 font-bold">Full Name:</p>
              <p className="break-words">
                {user.first_name} {user.middle_name} {user.last_name}
              </p>
            </td>
            <td className="block lg:table-cell flex lg:flex-none flex-row">
              <p className="lg:hidden ml-4 w-1/4 font-bold">Job:</p>
              <p className="break-all">{user.job}</p>
            </td>
            <td className="block lg:table-cell flex lg:flex-none flex-row">
              <p className="lg:hidden ml-4 w-1/4 font-bold">Phone:</p>
              <p className="break-all">{user.phone}</p>
            </td>
            <td className="block lg:table-cell flex lg:flex-none flex-row">
              <p className="lg:hidden ml-4 w-1/4 font-bold">Actions</p>
              <div className="btn-group">
                {/* <button className="btn">
                  <Image
                    src={`/assets/icons/edit.png`}
                    height={24}
                    width={24}
                    alt={""}
                  ></Image>
                </button>
                <button className="btn">
                  <Image
                    src={`/assets/icons/view.png`}
                    height={24}
                    width={24}
                    alt={""}
                  ></Image>
                </button>
                <button className="btn">
                  <Image
                    src={`/assets/icons/delete.png`}
                    height={24}
                    width={24}
                    alt={""}
                  ></Image>
                </button> */}
                <Link className="px-2 hover:text-blue-500 link" href="#">
                  {" "}
                  Edit{" "}
                </Link>{" "}
                |
                <Link className="px-2 hover:text-blue-500 link" href="#">
                  {" "}
                  View{" "}
                </Link>{" "}
                |
                <Link className="px-2 hover:text-blue-500 link" href="#">
                  {" "}
                  Delete{" "}
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  }
}
