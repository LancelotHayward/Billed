/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store"

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the UI should load", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByText("Envoyer une note de frais")[0]).toBeTruthy()
    })
    describe("When I click on select file", () => {
      test("Then the function handleChangeFile should be called", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          const new_bill = new NewBill({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage,
          });
        document.body.innerHTML = NewBillUI()
        const inputFile = screen.getByTestId("file")
        const blob = new Blob(["text"], { type: "text/plain" });
        const file = new File([blob], "file.txt", { type: "text/plain" });
        const mockEvent = {target: {value: "monfichier.test"}, preventDefault: () => {}}
        const handleChangeFile = jest.fn(() => new_bill.handleChangeFile(mockEvent));
        inputFile.addEventListener("change", handleChangeFile)
        fireEvent.change(inputFile, {
          target: {
            files: [file],
          },
        });
        expect(handleChangeFile).toHaveBeenCalledTimes(1);
        expect(inputFile.files[0].type).not.toMatch(/^image\//);
      })
      test("Then the function handleChangeFile should be called", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          const new_bill = new NewBill({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage,
          });
        document.body.innerHTML = NewBillUI()
        const inputFile = screen.getByTestId("file")
        const blob = new Blob(["text"], { type: "image" });
        const file = new File([blob], "file.jpg", { type: "image" });
        const mockEvent = {target: {value: "monfichier.test"}, preventDefault: () => {}}
        const handleChangeFile = jest.fn(() => new_bill.handleChangeFile(mockEvent));
        inputFile.addEventListener("change", handleChangeFile)
        fireEvent.change(inputFile, {
          target: {
            files: [file],
          },
        });
        expect(handleChangeFile).toHaveBeenCalledTimes(1);
        expect(inputFile.files[0].type).toMatch("image");
      })
    })
  })
  describe("When I am submitting a new bill", () => {
    // test("POST", async () => {
      // jest.spyOn(mockStore, "bills")
      //   Object.defineProperty(
      //       window,
      //       'localStorage',
      //       { value: localStorageMock }
      //   )
      //   window.localStorage.setItem('user', JSON.stringify({
      //     type: 'Employee',
      //     email: "a@a"
      //   }))
      //   const root = document.createElement("div")
      //   root.setAttribute("id", "root")
      //   document.body.appendChild(root)
      //   router()
      //   //test
      //   const mockUpdate = jest.fn(() => {
      //     return Promise.reject(new Error("Erreur 404"))
      //   })
      //   mockStore.bills.mockImplementationOnce(() => {
      //     return {
      //       update : mockUpdate
      //     }})
      //     const new_bill = new NewBill({
      //       document,
      //       onNavigate,
      //       store: null,
      //       localStorage: window.localStorage,
      //     });
      //   document.body.innerHTML = NewBillUI({ data: new_bill })
      //   $.fn.modal = jest.fn()
      //   const submit_button = screen.getAllByTestId("btn-submit")[0]
      //   const mockEvent = {target: {}, preventDefault: () => {}}
      //   const handleSubmit = jest.fn(() => new_bill.handleSubmit(mockEvent));
      //   sumbit_button.addEventListener("click", handleSubmit)
      //   userEvent.click(submit_button)
      //   expect(handleSubmit).toHaveBeenCalled()
      //   // expect(mockUpdate).toHaveBeenCalled()
      // })
      
      it("send bills from mock API POST", async () => {
        jest.spyOn(mockStore, "bills");
        //create method
        const CreateBill = await mockStore.bills().create();
        expect(CreateBill.key).toBe("1234");
  
        //update method
        const UpdateBill = await mockStore.bills().update();
        expect(UpdateBill.id).toBe("47qAXb6fIm2zOKkLzMro");
      });
    // })
  })
})
