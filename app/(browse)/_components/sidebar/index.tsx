import { Wrapper } from "./wrapper";
import { Toggle } from "./toggle";
import { Recommended } from "./recommended";
import { getRecommended } from "@/lib/recomended-service";

export const Sidebar = async () => {
  const recommended = await getRecommended();

  return (
    <Wrapper>
      <Toggle />
      <div className="space-v-4 pt-4 lg:pt-0">
      <Recommended data={recommended}/>   
      </div>
    </Wrapper>
    );
};