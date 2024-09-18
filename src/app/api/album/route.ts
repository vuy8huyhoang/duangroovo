import connection from "@/lib/connection";
import Checker from "@/utils/Checker";
import { getCurrentUser } from "@/utils/Get";
import { getServerErrorMsg, throwCustomError } from "@/utils/Error";
import { getQueryParams, objectResponse } from "@/utils/Response";
import { v4 as uuidv4 } from "uuid";
import Parser from "@/utils/Parser";

export const GET = async (request: Request) => {
  try {
    const params = getQueryParams(request);
    const currentUser = await getCurrentUser(request, false);
    const role = currentUser.role;
    const {
      limit,
      offset,
      id_album,
      id_artist,
      name,
      slug,
      url_cover,
      release_date,
      publish_date,
      description,
      last_update,
      created_at,
      is_show,
    }: any = params;
    const queryParams: any[] = [];

    const query = `
    SELECT 
      al.id_album,
      al.name,
      al.slug,
      al.url_cover,
      al.release_date,
      al.publish_date,
      al.created_at,
      al.last_update,
      al.is_show,
      ${Parser.queryArray(
        Parser.queryObject([
          "'id_artist', ar.id_artist",
          "'name', ar.name",
          "'slug', ar.slug",
          "'url_cover', ar.url_cover",
          "'created_at', ar.created_at",
          "'last_update', ar.last_update",
          "'is_show', ar.is_show",
        ])
      )} AS artists
    FROM Album al
    LEFT JOIN 
      Artist ar ON ar.id_artist = al.id_artist ${
        role === "admin" ? "" : " AND ar.is_show = 1"
      }
    WHERE TRUE
      ${role === "admin" ? "" : "AND al.is_show = 1"}
        
      ${
        (id_album !== undefined && `AND al.id_album LIKE '%${id_album}%'`) || ""
      }
      ${
        (id_artist !== undefined && `AND al.id_artist LIKE '%${id_artist}%'`) ||
        ""
      }
      ${(name !== undefined && `AND name LIKE '%${name}%'`) || ""}
      ${(slug !== undefined && `AND slug LIKE '%${slug}%'`) || ""}
      ${
        (url_cover !== undefined && `AND url_cover LIKE '%${url_cover}%'`) || ""
      }
      ${
        (description !== undefined &&
          `AND description LIKE '%${description}%'`) ||
        ""
      }
      ${
        (release_date !== undefined &&
          `AND release_date LIKE '%${release_date}%'`) ||
        ""
      }
      ${
        (publish_date !== undefined &&
          `AND publish_date LIKE '%${publish_date}%'`) ||
        ""
      }
      ${
        (last_update !== undefined &&
          `AND last_update LIKE '%${last_update}%'`) ||
        ""
      }
      ${
        (created_at !== undefined && `AND created_at LIKE '%${created_at}%'`) ||
        ""
      }
      ${(is_show !== undefined && `AND is_show LIKE '%${is_show}%'`) || ""}

      ${limit !== undefined ? ` LIMIT ${limit}` : ""}
      ${offset !== undefined ? ` OFFSET ${offset}` : ""}
    `;

    const [albumList]: Array<any> = await connection.query(query, queryParams);
    Parser.convertJson(albumList as Array<any>, "artists");
    albumList.forEach((item: any, index: number) => {
      item.artists = Parser.removeNullObjects(item.artists);
    });
    return objectResponse({ data: albumList });
  } catch (error) {
    return getServerErrorMsg(error);
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { name, slug, description, is_show } = body;

    // Validation
    Checker.checkString(name, true);
    Checker.checkString(slug);
    Checker.checkString(description);
    Checker.checkString(slug);
    Checker.checkIncluded(is_show, [0, 1]);

    // Check permission
    const currentUser = await getCurrentUser(request);
    if (currentUser?.role !== "admin")
      throwCustomError("Not enough permission", 403);

    // Check unique slug
    if (slug) {
      const [slugList]: Array<any> = await connection.query(
        "select id_type from Type where slug = ?",
        [slug]
      );
      if (slugList.length !== 0) throwCustomError("Slug is already exist", 400);
    }

    // Check slug not empty
    if (slug === "") throwCustomError("Slug cannot be empty string", 400);

    // Update DB
    const newId = uuidv4();
    const [result]: Array<any> = await connection.query(
      `
      insert into Type
        (
          id_type
          name,
          slug,
          description,
          is_show
        )  
      values 
        (?, ?, ?, ?, ?)
      `,
      [newId, name, slug, description, is_show]
    );

    return objectResponse({ newID: newId });
  } catch (error) {
    return getServerErrorMsg(error);
  }
};