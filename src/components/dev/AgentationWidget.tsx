import { Agentation } from "agentation";

export default function AgentationWidget() {
  if (!import.meta.env.DEV) return null;
  return <Agentation />;
}
