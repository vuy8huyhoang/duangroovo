import { getServerErrorMsg, throwCustomError } from "@/utils/Error";
import { objectResponse } from "@/utils/Response";
import { getCurrentUser } from "@/utils/Get";
import Parser from "@/utils/Parser";
import Fields from "@/utils/Fields";

export const GET = async (req: Request) => {
  try {
    // Get current user
    const user = await getCurrentUser(req, true);
    if (user.is_banned === "1") throwCustomError("Account banned", 403);

    return objectResponse(
      {
        data: Parser.filterObjectKeys(
          user,
          Fields.user(user.role) as Array<any>
        ),
      },
      200
    );
  } catch (e: any) {
    return getServerErrorMsg(e);
  }
};
