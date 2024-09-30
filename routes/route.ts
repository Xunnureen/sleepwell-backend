import express, { Request, Response } from "express";
import { User } from "../handlers/user";
import { Auth } from "../handlers/auth";
import { Unit } from "../handlers/unit";
import { Loan } from "../handlers/loan";
import { Member } from "../handlers/members";
import fetchDetailsByPhone from "../handlers/userInfo";
import { Repayment } from "../handlers/repayments";
import { AnalyticsController } from "../handlers/analytics";
import { authMiddleware } from "../middlewares/auth.middleware";

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
router.use(authMiddleware);

// Routes for the Member controller
router.post("/member", Member.create); // Add/create new member
router.get("/members", Member.getAllMembers); // Get all members
router.get("/member/:id", Member.singleMember); // Get single member by ID
router.patch("/member/:id", Member.updateMember); // Update member
router.delete("/member/:id", Member.deleteMember); // Delete member

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
router.get("/units/:id", Unit.getSingleUnit);
router.get("/units", Unit.getAllUnits);
//history of any units made..
router.get("/recentUnits/:memberId?", Unit.recentUnits);

// is already there in the system once you add to the existing one
//router.put("/units/:id", Unit.updateUnit);

//to be enable in future for now
//router.delete("/units/:id", Unit.deleteUnit);

// Loan
router.post("/loan", Loan.create);
router.get("/loan/:id", Loan.singleLoan);
router.get("/loans", Loan.getAllLoans);
router.put("/loan/:id", Loan.updateLoan);
//history of any loans made ..
router.get("/recentLoans/:memberId?", Loan.recentLoans);

// fetch user details with phoneNumber for those who dont have smartphone or incase...
router.get("/phone/:phoneNumber", fetchDetailsByPhone);

//Repayment
router.post("/repayment", Repayment.create);
router.get("/repayment/:id", Repayment.getById);
router.get("/repayments", Repayment.getAll);
router.put("/repayment/:id", Repayment.update);
//history of any repayment made...
router.get("/recentRepayment/:memberId?", Repayment.recentRepayments);

//for future to be enable
//router.delete("/repayments/:id", Repayment.delete);

//Analytics
router.get("/analytic/units/:memberId?", AnalyticsController.getUnitsAnalytics);
router.get(
  "/analytics/income/:memberId?",
  AnalyticsController.getIncomeAnalytics
);
router.get(
  "/analytics/loans/:memberId?",
  AnalyticsController.getLoansAnalytics
);
router.get(
  "/analytics/repayments/:memberId?",
  AnalyticsController.getRepaymentsAnalytics
);

export default router;
