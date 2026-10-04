import { Router } from "express";
import { addBookmark, listBookmarks, removeBookmark } from "../controllers/bookmarkController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", listBookmarks);
router.post("/", addBookmark);
router.delete("/:questionId", removeBookmark);

export default router;
