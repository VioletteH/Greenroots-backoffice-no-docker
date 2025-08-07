import express from "express";

import treeController from "../controllers/treeController";
import orderController from "../controllers/orderController";
import forestController from "../controllers/forestController";
import userController from "../controllers/userController";
import authController from "../controllers/authController";
import { requireAuth } from "../middleware/requireAuth";
import upload from "../../config/multer-config";

const routes = express.Router();

// PUBLIC ROUTES
routes.get("/login", authController.loginView);
routes.post("/login", authController.loginPost);
routes.get("/logout", authController.logout);

// PROTECTED ROUTES
routes.use(requireAuth);

// HOME
routes.get("/", (req, res) => {
  res.render("index");
});

// TREES
routes.get("/trees", treeController.trees);
routes.get("/trees/add", treeController.createTreeView);
routes.post("/trees/add", upload.single('image'), treeController.createTree);
routes.get("/trees/:id", treeController.tree); 
routes.get("/trees/:id/edit", treeController.updateTreeView); 
routes.patch("/trees/:id", upload.single('image'), treeController.updateTree);
routes.delete("/trees/:id", treeController.deleteTree);

//FORESTS
routes.get("/forests", forestController.forests);
routes.get("/forests/add", forestController.createForestView);
routes.post("/forests/add", upload.single('image'), forestController.createForest);
routes.get("/forests/:id", forestController.forest);
routes.get("/forests/:id/edit", forestController.updateForestView);
routes.patch("/forests/:id", upload.single('image'), forestController.updateForest);
routes.delete("/forests/:id", forestController.deleteForest);

//ORDERS
routes.get("/orders", orderController.orders)
routes.get("/orders/:id", orderController.order);
routes.get("/orders/:id/edit", orderController.updateOrderView);
routes.patch("/orders/:id", orderController.updateOrder);

//USERS
routes.get("/users", userController.users);
routes.get("/users/add", userController.createUserView);
routes.post("/users/add", userController.createUser);
routes.get("/users/:id", userController.user);
routes.get("/users/:id/edit", userController.updateUserView);
routes.patch("/users/:id", userController.updateUser);
routes.delete("/users/:id", userController.deleteUser);

export default routes;
