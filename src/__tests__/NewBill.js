/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the UI should load", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(getAllByText("Envoyer une note de frais")[0]).toBeTruthy()
    })
  })
})
