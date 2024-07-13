import express, { Request, Response } from "express";
import { User } from "../handlers/user";
import { Auth } from "../handlers/auth";
import { Unit } from "../handlers/unit";
import { Loan } from "../handlers/loan";
import fetchDetailsByPhone from "../handlers/userInfo";
import { Repayment } from "../handlers/repayments";
//import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

// healthcheck
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
  });
});

//sign in user route
router.post("/auth", Auth.login);

// Apply authMiddleware to all routes defined after this line
//router.use(authMiddleware);

//user
router.post("/user", User.create);
router.get("/users", User.getAllUsers);
router.get("/user/:id", User.singleUser);
router.patch("/user/:id", User.updateUser);
router.delete("/user/:id", User.deleteUser);

// update password from default to be enable..
router.put("/user/update-password/:id", User.updateDefaultPassword);

//Unit

router.post("/units", Unit.create);
router.get("/units/:id", Unit.getUnit);
router.get("/units", Unit.getAllUnits);
router.put("/units/:id", Unit.updateUnit);

//to be enable in future for now
//router.delete("/units/:id", Unit.deleteUnit);

// Loan
router.post("/loan", Loan.create);
router.get("/loan/:id", Loan.getLoan);
router.get("/loans", Loan.getAllLoans);
router.put("/loan/:id", Loan.updateLoan);

// fetch user details with phoneNumber for those who dont have smartphone or incase...
router.get("/phone/:phoneNumber", fetchDetailsByPhone);

//Repayment
router.post("/repayment", Repayment.create);
router.get("/repayments/:id", Repayment.getById);
router.get("/repayments", Repayment.getAll);
router.put("/repayments/:id", Repayment.update);
//for future to be enable
//router.delete("/repayments/:id", Repayment.delete);

export default router;
