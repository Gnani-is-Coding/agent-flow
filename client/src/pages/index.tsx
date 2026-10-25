import { useEffect } from "react";
import Router from "next/router";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/store/authStore";
import { Spinner } from "@/components/Spinner";

export default function Home() {
  
  return <Spinner />;
}
