import { screen, fireEvent} from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { bills } from "../fixtures/bills.js"
import "@testing-library/jest-dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"

//Before & After all
jest.mock("../app/store", () => mockStore)
const setNewBill = () => {
  return new NewBill({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  })
}
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  })
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  )
})
beforeEach(() => {
  const root = document.createElement("div")
  root.setAttribute("id", "root")
  document.body.append(root)
  router()
  document.body.innerHTML = NewBillUI()
  window.onNavigate(ROUTES_PATH.NewBill)
})
afterEach(() => {
  jest.resetAllMocks()
  document.body.innerHTML = ""
})

//Tests
describe("Given I am logged-in as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the new bill icon should be highlighted", () => {
      const windowIcon = screen.getByTestId("icon-mail")
      expect(windowIcon).toHaveClass("active-icon")
    })
    describe("When I correctly fill the fields and click the submit button", () => {
      test("Then I should be sent to the Bills page", async () => {
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        })
        const inputData = bills[0]
        const newBillForm = screen.getByTestId("form-new-bill")
        const handleSubmit = jest.fn(newBill.handleSubmit)
        const file = new File(["img"], inputData.fileName, {
          type: ["image/jpg"],
        })
        newBill.fileName = file.name
        const submitButton = screen.getByRole("button", { name: /envoyer/i })
        expect(submitButton.type).toBe("submit")
        newBillForm.addEventListener("submit", handleSubmit)
        userEvent.click(submitButton)
        expect(handleSubmit).toHaveBeenCalledTimes(1)
        expect(screen.getByText(/Mes notes de frais/i)).toBeVisible()
      })
      test("Then there should be the creation of new bill", async () => {
        const createBill = jest.fn(mockStore.bills().create)
        const updateBill = jest.fn(mockStore.bills().update)
        const { fileUrl, key } = await createBill()
        expect(createBill).toHaveBeenCalledTimes(1)
        expect(key).toBe("1234")
        expect(fileUrl).toBe("https://localhost:3456/images/test.jpg")
        const newBill = updateBill()
        expect(updateBill).toHaveBeenCalledTimes(1)
        await expect(newBill).resolves.toEqual({
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl:
            "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2004-04-04",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
        })
      })
    })
    describe("When input is empty", () => {
      test("then PCT should be 20", () => {
        const newBill = setNewBill()
        const inputData = bills[0]
        const newBillForm = screen.getByTestId("form-new-bill")
        const handleSubmit = jest.spyOn(newBill, "handleSubmit")
        const updateBill = jest.spyOn(newBill, "updateBill")
        newBill.fileName = inputData.fileName
        newBillForm.addEventListener("submit", handleSubmit)
        fireEvent.submit(newBillForm)
        expect(handleSubmit).toHaveBeenCalledTimes(1)
        expect(updateBill).toHaveBeenCalledWith(
          expect.objectContaining({
            pct: 20,
          })
        )
      })
    })
    describe("When I leave fields empty and I click submit", () => {
      test("Then I should stay on this page", () => {
        const newBill = setNewBill()
        const newBillForm = screen.getByTestId("form-new-bill")
        const handleSubmit = jest.spyOn(newBill, "handleSubmit")
        newBillForm.addEventListener("submit", handleSubmit)
        fireEvent.submit(newBillForm)
        expect(handleSubmit).toHaveBeenCalledTimes(1)
        expect(newBillForm).toBeVisible()
      })
    })
    describe("When I upload a file with the incorrect extension", () => {
      test("Then it should show an error message", () => {
        const newBill = setNewBill()
        const handleChangeFile = jest.spyOn(newBill, "handleChangeFile")
        const imageInput = screen.getByTestId("file")
        const validateFile = jest.spyOn(newBill, "validateFile")
        imageInput.addEventListener("change", handleChangeFile)
        fireEvent.change(imageInput, {
          target: {
            files: [
              new File(["document"], "document.pdf", {
                type: "application/pdf",
              }),
            ],
          },
        })
        expect(handleChangeFile).toHaveBeenCalledTimes(1)
        expect(validateFile.mock.results[0].value).toBeFalsy()
        expect(imageInput).toHaveClass("is-invalid")
      })
    })
    describe("When I upload a file with a valid extension", () => {
      test("Then it shouldn't show an error message", () => {
        const newBill = setNewBill()
        const handleChangeFile = jest.spyOn(newBill, "handleChangeFile")
        const imageInput = screen.getByTestId("file")
        const validateFile = jest.spyOn(newBill, "validateFile")
        imageInput.addEventListener("change", handleChangeFile)
        fireEvent.change(imageInput, {
          target: {
            files: [
              new File(["image"], "image.jpg", {
                type: "image/jpg",
              }),
            ],
          },
        })
        expect(handleChangeFile).toHaveBeenCalledTimes(1)
        expect(validateFile.mock.results[0].value).toBeTruthy()
        expect(imageInput).not.toHaveClass("is-invalid")
      })
    })
    describe("When the API has an error", () => {
      test("Then 404", async () => {
        const newBill = setNewBill()
        const mockedBill = jest
          .spyOn(mockStore, "bills")
          .mockImplementationOnce(() => {
            return {
              create: jest.fn().mockRejectedValue(new Error("Erreur 404")),
            }
          })
        await expect(mockedBill().create).rejects.toThrow("Erreur 404")
        expect(mockedBill).toHaveBeenCalledTimes(1)
        expect(newBill.billId).toBeNull()
        expect(newBill.fileUrl).toBeNull()
        expect(newBill.fileName).toBeNull()
      })
      test("Then 500 Internal Server error", async () => {
        const newBill = setNewBill()
        const mockedBill = jest
          .spyOn(mockStore, "bills")
          .mockImplementationOnce(() => {
            return {
              create: jest.fn().mockRejectedValue(new Error("Erreur 500")),
            }
          })
        await expect(mockedBill().create).rejects.toThrow("Erreur 500")
        expect(mockedBill).toHaveBeenCalledTimes(1)
        expect(newBill.billId).toBeNull()
        expect(newBill.fileUrl).toBeNull()
        expect(newBill.fileName).toBeNull()
      })
    })
  })
})