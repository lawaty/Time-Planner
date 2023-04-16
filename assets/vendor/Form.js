// Form Types
class BasicForm {
  /**
   * class for basic form flow (validation, data extraction, and ajax requesting)
   */
  constructor(form) {
    /**
     * Form Initialization.
    */
    this.form = form
    this.form_title = $(form).attr('id')
    if (this.form_title === undefined)
      console.log("id not found for " + this.form_title + " form")

    this.initialize()
  }

  get(name) {
    return $(this.form).find(`[name=${name}]`).val()
  }

  set(name, value){
    $(this.form).find(`[name=${name}]`).val(value)
  }

  initialize() {
    if ($(this.form).attr('form_type') != 'list')
      this.validators = new Validators(this.form)
    this.sender = new Sender(this.form)

    this.submitBtn = $("[submit=" + $(this.form).attr('id') + "]")
    if (!this.submitBtn.length)
      console.log("submit btn not found for " + this.title + " form")
    $(this.submitBtn).attr('type', 'button')
    $(this.submitBtn).click(this.run.bind(this))
  }

  setCallback(callback) {
    this.sender.callback = callback;
  }

  payload() {
    return new FormData(this.form[0])
  }

  run() {
    /**
     * run the form
     */
    if (this.validators.validateAll()) {
      let form_data = this.payload()
      this.sender.send(form_data)
    }
  }
}

// Utilities
class Sender {
  /**
   * Class for form-api communication
   */
  constructor(form) {
    this.form = form
    this.form_title = $(form).attr('id')
    this.api = $(form).attr('api')
    if (this.api === undefined)
      console.log("api destination not found for " + this.form_title + " form")
    this.type = $(form).attr('request_type') !== undefined ? $(form).attr('request_type') : 'GET'
  }

  send(data) {
    AJAX.ajax({
      url: this.api,
      type: this.type,
      data: data,
      complete: function (xhr) {
        if (typeof (this.callback) == "function")
          this.callback(xhr)
      }.bind(this)
    })
  }
}