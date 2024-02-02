const { Builder, By, Select, until } = require('selenium-webdriver');
const yaml = require('js-yaml')
const fs = require('node:fs')

let driver = new Builder().forBrowser('chrome').build()
driver.manage().window().maximize()
let leaveId

const path = require('path')
const attachment1 = __dirname + '/../resources/attachment1.png'
const attachment2 = __dirname + '/../resources/attachment2.png'
const readTestDataPath = __dirname + '/../testData.yaml'
const loadYamal = fs.readFileSync(readTestDataPath, 'utf8')
const testData = yaml.load(loadYamal)

const {
  website_url: APP_URL,
  title: PAGE_TITLE,
  email: EMAIL,
  password: PASSWORD,
  error_message: LEAVE_ERROR_MESSAGE,
  leave_date: LEAVE_DATE,
} = testData;

describe('Add New Leave', () => {

  jest.setTimeout(30000);

  test('TC01 Visit login page', async () => {
    await allure.step("Check login page URL", async function() {
      await driver.get(APP_URL)
      // implicit wait
      await driver.manage().setTimeouts({ implicit: 15000 })
      const title = await driver.getTitle()
      allure.parameter('ROOT_URL', APP_URL)
      expect(PAGE_TITLE).toBe(title)
    })
  })

  test('TC02 Check login form input', async function() {
    await allure.step("Check login form input", async function() {

      await this.step("Check email field", async function() {
        // explicit wait (wait until element is visible)
        await driver.wait(until.elementLocated(By.name('email')), 5000)
        const emailInput = await driver.findElement(By.name('email'))
        const emailInputIsVisible = await emailInput.isDisplayed()
        expect(emailInputIsVisible).toBeTruthy()

        allure.parameter('email', EMAIL)
        emailInput.sendKeys(EMAIL)
      })

      await this.step("Check password field", async function() {
        const passwordInput = await driver.findElement(By.name('password'))
        const passwordInputIsVisible = await passwordInput.isDisplayed()
        expect(passwordInputIsVisible).toBeTruthy()

        allure.parameter('password', PASSWORD)
        passwordInput.sendKeys(PASSWORD)
      })

      await this.step("Check login button", async function() {
        const loginButton = await driver.findElement(By.css('button[type="submit"]'))
        const loginButtonIsVisible = await loginButton.isDisplayed()
        expect(loginButtonIsVisible).toBeTruthy()

        loginButton.click()
      })
    })

  })

  test('TC03 Visit list leave page', async () => {
    await allure.step("Visit list leave page", async function() {
      const leavePageUrl = `${APP_URL}/#/Leave`

      await driver.get(leavePageUrl)
      // implicit wait
      await driver.manage().setTimeouts({ implicit: 5000 })
      const getCurrentUrl = await driver.getCurrentUrl()
      allure.parameter('leavePageUrl', leavePageUrl)
      expect(leavePageUrl).toBe(getCurrentUrl)
    })

  })

  test('TC04 Visit add new leave page', async () => {

    await allure.step("Click on Add New Leave button", async  function() {
      const addNewLeaveButton = await driver.findElement(By.css('.add-new'))
      addNewLeaveButton.click()
    })

    await new Promise(resolve => setTimeout(resolve, 1000));
    await allure.step("Check the add new leave page URL", async function() {
      const addNewLeavePageUrl = `${APP_URL}/#/LeaveDetails`

      const getCurrentUrl = await driver.getCurrentUrl()
      allure.parameter('addNewLeavePageUrl', addNewLeavePageUrl)
      expect(addNewLeavePageUrl).toBe(getCurrentUrl)
    })

  }, 10000)

  test('TC05 Check form validation for required fields', async () => {
    await allure.step("Click on Save button without filling any field", async () => {
    // explicit wait (wait until element is visible)
      await driver.wait(until.elementLocated(By.css('form > .mb-3 button')), 5000)
      const saveButton = await driver.findElement(By.css('form > .mb-3 button'))
      saveButton.click()
    })

    await allure.step("Check error message", async () => {
    // explicit wait (wait until element is visible)
    await driver.wait(until.elementLocated(By.css('.Toastify__toast.Toastify__toast-theme--colored > .Toastify__toast-body > div')), 5000)
      const errorElements = await driver.findElements(By.css('.Toastify__toast.Toastify__toast-theme--colored > .Toastify__toast-body > div'))
      const errorMessage = await errorElements[1].getAttribute('textContent')
      allure.parameter('LEAVE_ERROR_MESSAGE', LEAVE_ERROR_MESSAGE)
      expect(LEAVE_ERROR_MESSAGE).toBe(errorMessage)
    })
  })

  test('TC06 Fill form with valid data', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Select employee", async () => {
      // Select Employee
      const employeeSelect = await driver.findElement(By.name('employee_id'))
      const select = new Select(employeeSelect)
      select.selectByIndex(3)
    })

    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Select leave from date", async () => {
      // Select From Date
      const fromDateInput = await driver.findElement(By.name('from_date'))
      fromDateInput.sendKeys(LEAVE_DATE)
    })

    await allure.step("Select leave to date", async () => {
      // Select To Date
      const toDateInput = await driver.findElement(By.name('to_date'))
      toDateInput.sendKeys(LEAVE_DATE)
    })

    await allure.step("Select leave reason", async () => {
      // Select Leave Type
      const leaveTypeSelect = await driver.findElement(By.name('leave_type'))
      const select2 = new Select(leaveTypeSelect)
      select2.selectByVisibleText('Sick Leave')
    })

    // sleep for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Save leave", async () => {
      // Save leave
      const saveButton = await driver.findElement(By.css('form > .mb-3 button'))
      saveButton.click()
    })
  })

  test('TC07 Modify leave and Save', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Update leave status", async function() {
      const status = await driver.findElement(By.name('status'))
      const select = new Select(status)
      select.selectByValue('Approved')
    })

    await allure.step("Leave number of days", async function() {
      const no_of_days = await driver.findElement(By.name('no_of_days'))
      no_of_days.sendKeys('1')
    })

    await new Promise(resolve => setTimeout(resolve, 3000));
    driver.executeScript('window.scrollTo(0,0);')
    await allure.step("Click on Apply button", async function() {
      const allButtons = await driver.findElements(By.css('form >  .mb-3 button'))
      // Apply modification
      allButtons[1].click()
    })

    await allure.step("Get leave id from URL", async function() {
      const pageUrl = await driver.getCurrentUrl()
      const match = pageUrl.match(/\/LeavesEdit\/(\d+)/);
      leaveId = match ? match[1] : null;
      allure.parameter('leaveId', leaveId)
    })

    await new Promise(resolve => setTimeout(resolve, 3000))
    await allure.step("Click on Save button", async function() {
      const saveButton = await driver.findElements(By.css('form > .mb-3 button'))
      // get the content of the saveButton[1]
      // const saveButtonContent = await saveButton[1].getAttribute('textContent')
      // console.log(saveButtonContent)
      // get the content of the saveButton
      // Save modification
      saveButton[1].click()
    })
  })

})

describe('List Leave and Edit Leave', () => {
  test('TC01 Visit list leave page', async () => {

    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Visit list leave page", async function() {
      await driver.get(`${APP_URL}/#/Leave`)
      const getCurrentUrl = await driver.getCurrentUrl()
      expect(`${APP_URL}/#/Leave`).toBe(getCurrentUrl)
    })
  })

  test('TC02 Check leave list pagination', async () => {
    await allure.step("Check leave list pagination", async function() {
      const nextPge = await driver.findElement(By.css('.paginate_button.next'))
      nextPge.click()
    })
    await new Promise(resolve => setTimeout(resolve, 2000));
  })

  test('TC03 Go to edit leave page', async () => {
    await allure.step("Go to edit leave page", async function() {
      const leaveEditPageUrl = `${APP_URL}/#/LeavesEdit/${leaveId}?tab=1`
      allure.parameter('leaveEditPageUrl', leaveEditPageUrl)

      await driver.get(leaveEditPageUrl)
      const getCurrentUrl = await driver.getCurrentUrl()
      expect(leaveEditPageUrl).toBe(getCurrentUrl)
    })
  })

  test('TC04 Attach file', async () => {
    await allure.step("Click on the file icon", async function() {
      const fileTabInput = await driver.findElement(By.css('.tab-content button'))
      fileTabInput.click()
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await allure.step("Attach file 1", async function() {
      const fileInput = await driver.findElement(By.css('input[type="file"]'))
      let file1 = path.resolve(attachment1)
      fileInput.sendKeys(file1)
    })

    await new Promise(resolve => setTimeout(resolve, 1000));
    await allure.step("Click on the upload button", async function() {
      const uploadButton = await driver.findElements(By.css('.modal-footer button'))
      uploadButton[0].click()
    })

    await new Promise(resolve => setTimeout(resolve, 1000));
    await allure.step("Click on the file icon again", async function() {
      const fileTabInput = await driver.findElement(By.css('.tab-content button'))
      fileTabInput.click()
    })

    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Attach file 2", async function() {

      let file2 = path.resolve(attachment2)
      await driver.findElement(By.css('input[type="file"]')).sendKeys(file2)
    })

    await allure.step("Click on the upload button", async function() {
      await driver.findElement(By.css('.modal-footer button')).click()
    })

  })

  test('TC05 Delete attached file', async () => {

    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Click on the delete icon", async function() {
      const deleteIcon = await driver.findElements(By.css('.tab-content.p-4 button'))
      deleteIcon[1].click()
    })

    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Click on the confirm button", async function() {
      const confirmButtons = await driver.findElements(By.css('.swal2-actions button'))
      confirmButtons[0].click()

      await new Promise(resolve => setTimeout(resolve, 1000));
      await driver.findElement(By.css('.swal2-actions button')).click()

    })

    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Click on the delete icon again", async function() {
      const deleteIcon = await driver.findElements(By.css('.tab-content.p-4 button'))
      deleteIcon[1].click()
    })

    await new Promise(resolve => setTimeout(resolve, 2000));
    await allure.step("Click on the confirm button", async () => {
      const confirmButtons = await driver.findElements(By.css('.swal2-actions button'))
      confirmButtons[0].click()

      await new Promise(resolve => setTimeout(resolve, 2000));
      await driver.findElement(By.css('.swal2-actions button')).click()
    })

    driver.executeScript('window.scrollTo(0,0);')
    await new Promise(resolve => setTimeout(resolve, 2000));
    allure.step("Click on the delete button", async () => {
      const deleteButton = await driver.findElement(By.css('.card-body .btn-danger'))
      deleteButton.click()
    })

    await new Promise(resolve => setTimeout(resolve, 1000));
    await allure.step("Click on the confirm button", async () => {
      const confirmButtons = await driver.findElements(By.css('.swal2-actions button'))
      confirmButtons[0].click()

      // await driver.findElement(By.css('.swal2-actions button')).click()
    }) 
  })

})


describe('Leave menu and edit leave page icon', () => {
  test('TC01 Click on leave menu', async () => {
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    allure.step("Click on PayrollHR menu", async function() {
      const payrollMenu = await driver.findElements(By.css('ul.nav.flex-column > li.nav-item'))
      payrollMenu[3].click()
    })

    await new Promise(resolve => setTimeout(resolve, 3000));
    await allure.step("Click on Leave menu", async function() {
      const leaveMenu = await driver.findElements(By.css('.subMenu.collapse.show li'))
      leaveMenu[0].click()
    })

  })

  test('TC02 Click on edit leave page icon', async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await allure.step("Click on edit leave page icon", async function() {
      const editIcons = await driver.findElements(By.css('#example .editlink'))
      editIcons[0].click()
    })
  })

  test('TC03 Back to list leave page', async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await allure.step("Click on back button", async function() {
      const allButtons = await driver.findElements(By.css('form >  .mb-3 button'))
      allButtons[2].click()
    })
  })

})
