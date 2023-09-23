import { Api, Grid } from "../../config/admin-interface";

const apis = require("../../../admin/api.json");
const menus = require("../../../admin/menu.json");
const enums = require("../../../admin/enum.json");
const grids = require("../../../admin/grid.json");
const forms = require("../../../admin/form.json");

function getApiByName(name: string) {
  let api = apis.find((a: Api) => a.name === name);
  if (!api) {
    throw new Error("api_not_found");
  }
  return api;
}
function getGridByName(name: string) {
  let data = grids.find((a: Grid) => a.name === name);
  if (!data) {
    throw new Error("grid_not_found");
  }
  return data;
}
function getAllEnums() {
  return enums;
}

function getAllMenus() {
  return menus;
}
function getAllForms() {
  return forms;
}
function getAllGrids() {
  return grids;
}

const admin = {
  getApiByName,
  getAllEnums,
  getAllMenus,
  getAllForms,
  getAllGrids,
  getGridByName
};
export default admin;
