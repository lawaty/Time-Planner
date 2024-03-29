const APP = 'Time Planner';

// Date and Time
// =============

/**
 * Ndate extends the built-in Date object to add some utility methods.
 * 
 * @class
 */
class Ndate extends Date {
  /**
   * A subclass of the built-in Date class with additional functionality.
   * 
   * @class
   */

  /**
   * Adds a given number of days to the current date and returns the updated date object.
   * 
   * @param {number} num_of_days - The number of days to add.
   * @returns {Ndate} The updated date object.
   */
  addDays(num_of_days) {
    this.setDate(this.getDate() + num_of_days);
    return this;
  }

  /**
   * Adds a given number of weeks to the current date and returns the updated date object.
   * 
   * @param {number} num_of_weeks - The number of weeks to add.
   * @returns {Ndate} The updated date object.
   */
  addWeeks(num_of_weeks) {
    this.setDate(this.getDate() + num_of_weeks * 7);
    return this;
  }

  /**
   * Adds a given number of months to the current date and returns the updated date object.
   * 
   * @param {number} num_of_months - The number of months to add.
   * @returns {Ndate} The updated date object.
   */
  addMonths(num_of_months) {
    this.setMonth(this.getMonth() + num_of_months);
    this.setDate(1);
    return this;
  }

  /**
   * Returns a string representation of the date in ISO format (YYYY-MM-DD).
   * 
   * @returns {string} The date in ISO format.
   */
  toString() {
    const offset = this.getTimezoneOffset();
    let temp = new Ndate(this.getTime() - (offset * 60 * 1000));
    return temp.toISOString().split('T')[0];
  }

  /**
   * Calculates the difference between the current date and the given date and returns an NInterval object representing the duration of the difference.
   * 
   * @param {Ndate} date - The date to calculate the difference from.
   * @returns {NInterval} An NInterval object representing the duration of the difference.
   */
  diff(date) {
    return new NInterval({ millis: Math.abs(date - this) });
  }

  /**
   * Returns the index of the first day of the month (0-6) of the current date.
   * 
   * @returns {number} The index of the first day of the month.
   */
  firstDayOfMonth() {
    return new Ndate(this.getFullYear(), this.getMonth(), 1).getDay();
  }

  /**
   * Returns the last day of the month of the current date.
   * 
   * @returns {number} The last day of the month.
   */
  lastDayOfMonth() {
    return new Ndate(this.getFullYear(), this.getMonth() + 1, 0).getDate();
  }

  /**
   * Checks if the given date is the same as the current date.
   * 
   * @param {Ndate} date - The date to compare to.
   * @returns {boolean} True if the dates are the same, false otherwise.
   */
  sameDate(date) {
    return date.getFullYear() == this.getFullYear() &&
      date.getMonth() == this.getMonth() &&
      date.getDate() == this.getDate();
  }
}

const SEC_PER_MIN = 60;

const MS_PER_SEC = 1000;
const MS_PER_MIN = MS_PER_SEC * 60;
const MS_PER_HOUR = MS_PER_MIN * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

const MINS_PER_HOUR = 60;
const SEC_PER_HOUR = MINS_PER_HOUR * 60;

/**
 * A class that represents a duration of time, with properties for the duration in milliseconds, seconds,
 * minutes, hours, and days, and methods to format the duration as a clock string and construct a new
 * `NInterval` from a clock string.
 *
 * @class NInterval
 */
class NInterval {
  /**
   * Creates a new `NInterval` instance from an object with one of the following properties:
   * - `millis`: the duration in milliseconds
   * - `secs`: the duration in seconds
   * - `mins`: the duration in minutes
   *
   * @constructor
   * @param {Object} object - The object used to initialize the `NInterval` instance
   * @throws {Error} If the `object` parameter does not have a valid property
   */
  constructor(object) {
    if (object.hasOwnProperty('millis'))
      this.millis = object.millis;
    else if (object.hasOwnProperty('secs'))
      this.millis = object.secs * MS_PER_SEC;
    else if (object.hasOwnProperty('mins'))
      this.millis = object.mins * MS_PER_MIN;
    else
      throw new Error("Weird Input to NInterval: found" + object)

    this.total_millis = this.millis;

    this.days = parseInt(this.millis / MS_PER_DAY);
    this.millis -= this.days * MS_PER_DAY;

    this.hrs = parseInt(this.millis / MS_PER_HOUR);
    this.millis -= this.hrs * MS_PER_HOUR;

    this.mins = parseInt(this.millis / MS_PER_MIN);
    this.millis -= this.mins * MS_PER_MIN;

    this.secs = parseInt(this.millis / MS_PER_SEC);

    this.millis -= this.secs * MS_PER_SEC;
  }

  /**
   * Returns a formatted clock string representing the duration of this `NInterval` instance.
   * The string has the format "HH:MM:SS", where "HH" is the number of hours, "MM" is the number of minutes,
   * and "SS" is the number of seconds.
   *
   * @method formatClock
   * @returns {string} A formatted clock string representing the duration of this `NInterval` instance
   */
  formatClock() {
    let hours = this.hrs < 10 ? '0' + this.hrs : this.hrs
    let minutes = this.mins < 10 ? '0' + this.mins : this.mins
    let seconds = this.secs < 10 ? '0' + this.secs : this.secs

    return `${hours}:${minutes}:${seconds}`
  }

  /**
   * Creates a new `NInterval` instance from a clock string with the format "HH:MM:SS",
   * where "HH" is the number of hours, "MM" is the number of minutes, and "SS" is the number of seconds.
   *
   * @static
   * @method fromClock
   * @param {string} clock - A clock string with the format "HH:MM:SS"
   * @returns {NInterval | null} A new `NInterval` instance representing the duration of the clock string
   */
  static fromClock(clock) {
    let regex = Regex.TIME
    if (!regex.test(clock)) {
      try {
        throw new Error("Invalid Clock Format")
      } catch (error) {
        console.warn(error.stack)
        return null;
      }
    }

    let seconds = parseInt(clock.split(':')[0]) * SEC_PER_HOUR + parseInt(clock.split(':')[1]) * SEC_PER_MIN + parseInt(clock.split(':')[2])
    return new NInterval({ secs: seconds })
  }

  /**
   * Returns the total time in the specified unit.
   *
   * @param {string} unit - The unit to calculate the total time for. Valid values are "hrs", "mins", and "secs".
   * @returns {number} The total time in the specified unit, or -1 if the unit is invalid.
   */
  total(unit) {
    switch (unit) {
      case 'hrs':
        return parseInt(this.hrs)
      case 'mins':
        return parseInt(this.mins + this.hrs * 60)
      case 'secs':
        return parseInt(this.secs + this.mins * 60 + this.hrs * 3600)
      default:
        return -1;
    }
  }
}
/* ---------------------------------------------------------------------- */

// Regex MACROS
// ============

/**
 * An object containing regular expressions for common validation purposes.
 * @typedef {Object} Regex
 * @property {RegExp} INT - Regular expression to validate an integer.
 * @property {RegExp} SINT - Regular expression to validate a signed integer.
 * @property {RegExp} ZERO_ONE - Regular expression to validate a zero or one value.
 * @property {RegExp} MONTH - Regular expression to validate a month (1-12).
 * @property {RegExp} DATE - Regular expression to validate a date in the format YYYY-MM-DD.
 * @property {RegExp} TIME - Regular expression to validate a time in the format HH:MM.
 * @property {RegExp} DATE_TIME - Regular expression to validate a date and time in the format YYYY-MM-DD HH:MM.
 * @property {RegExp} DATE_TIME_SEC - Regular expression to validate a date and time with seconds in the format YYYY-MM-DD HH:MM:SS.
 * @property {RegExp} DAY_TIME - Regular expression to validate a day and time in the format "Day HH:MM", where Day is one of Sun, Mon, Tue, Wed, Thu, Fri, Sat.
 * @property {RegExp} JWT - Regular expression to validate a JWT token.
 * @property {RegExp} LOGIN - Regular expression to validate a login string with Arabic script, letters, numbers, hyphens, and spaces.
 * @property {RegExp} EMAIL - Regular expression to validate an email address.
 * @property {RegExp} NAME - Regular expression to validate a name with Arabic script, letters, spaces.
 * @property {RegExp} PHONE - Regular expression to validate a phone number.
 * @property {RegExp} GRADE - Regular expression to validate a grade (1-12).
 * @property {RegExp} GENERIC - Regular expression to validate any string with Arabic script, letters, numbers, hyphens, parentheses, spaces.
 * @property {RegExp} ANY - Regular expression to validate any string.
 */
const Regex = {
  INT: /^[0-9]*$/,
  SINT: /^-?[0-9]*$/,
  ZERO_ONE: /^[0-1]$/,

  MONTH: /^([1-9]|1[0-2])$/,
  DATE: /^(\d{4})-(\d{2})-(\d{2})$/,
  TIME: /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/,
  DATE_TIME: /^(\d{4})-(\d{2})-(\d{2}) [0-9]{2}:[0-9]{2}$/,
  DATE_TIME_SEC: /^(\d{4})-(\d{2})-(\d{2}) [0-9]{2}:[0-9]{2}:[0-9]{2}$/,
  DAY_TIME: /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) [0-9]{2}:[0-9]{2}$/,

  JWT: /^[\w-]*\.[\w-]*\.[\w-]*$/,
  LOGIN: /^[\p{Script=Arabic}\w\-. ]*$/gu,
  EMAIL: /^[\w_\-.]+@[\w]+\.[\w]*$/,
  NAME: /^[\p{Script=Arabic}\w ]*$/gu,
  PHONE: /^\+?[0-9]+$/,
  GRADE: /^([1-9]|1[0-2])$/,
  GENERIC: /^[\p{Script=Arabic}\u0020-\u002F\u005C\u005F\w_\-\)\(.+\s]*$/gu,
  ANY: /^.*$/,
}

/* ---------------------------------------------------------------------- */

// LocalStorage Wrapper
// ====================

let local = {
  /**
   * Retrieves a value from localStorage given its key.
   *
   * @memberof local
   * @function get
   * @param {string} key - The key of the value to retrieve.
   * @returns {string|false} - The value associated with the key, or false if the key doesn't exist.
   */
  get: function (key) {
    key = `${APP}-${key}`
    let result = localStorage.getItem(key)
    if (result !== null)
      return result
    return false
  },

  /**
   * Stores a key-value pair in localStorage.
   *
   * @memberof local
   * @function set
   * @param {string} key - The key of the value to store.
   * @param {string} value - The value to store.
   */
  set: function (key, value) {
    key = `${APP}-${key}`
    localStorage.setItem(key, value)
  },

  /**
   * Removes a value from localStorage given its key.
   *
   * @memberof local
   * @function remove
   * @param {string} key - The key of the value to remove.
   */
  remove: function (key) {
    key = `${APP}-${key}`
    localStorage.removeItem(key)
  }
};

/* ---------------------------------------------------------------------- */

// Sync Manager
// ============

class MissingInfo extends Error {
  constructor(type, missing, object) {
    super()
    this.name = 'MissingInfo'
    this.message = `'${missing}' is required for object of type '${type}'. Found in this object: ${JSON.stringify(object)}`
  }
}

class TypeNotFound extends Error {
  constructor(type) {
    super()
    this.name = 'TypeNotFound'
    this.message = `'${type}' is not registered`
  }
}

class PropertyDoesNotExist extends Error {
  constructor(type, property) {
    super()
    this.name = 'PropertyDoesNotExist'
    this.message = `'${property}' does not exist for resource of type ${type}`
  }
}

class ResourceNotFound extends Error {
  constructor(type, key) {
    super()
    this.name = 'ResourceNotFound'
    this.message = `Key '${key}' is not attached to any resource of type ${type}`
  }
}

/**
 * A JavaScript object that manages the synchronization of objects.
 * @type {syncManager}
 */
let syncManager = {
  types: {},

  /**
   * 
   * @param {string} type 
   * @param {Array<string>} fields 
   */
  registerType: function (type, fields) {
    this.types[type] = fields
    this[type] = {}
  },

  /**
   * returns an object with type and key
   * @param {string} type 
   * @param {string|int} key 
   * @returns {any}
   */
  get: function (type, key) {
    if (this.validateType(type))
      return undefined

    return this[type][key]
  },

  /**
   * adds new resource with type and key
   * @param {string} type 
   * @param {object} object 
   * @param {string|int} key 
   * @returns {boolean}
   */
  add: function (type, object, key = null) {
    if (this.validateType(type))
      return false

    if (key === null)
      key = object[this.types[type][0]]

    if (key === undefined) {
      try {
        throw new MissingInfo(type, this.types[type][0], object)
      } catch (error) {
        console.warn(error.stack)
      }
    }

    let healthy_object = {}
    for (let required of this.types[type]) {
      if (object[required] === undefined) {
        try {
          throw new MissingInfo(type, required, object)
        } catch (error) {
          console.warn(error.stack)
        }
      }

      healthy_object[required] = object[required]
    }

    $(document).trigger(`${type}-changed`)
    $(document).trigger(`${type}-added`, healthy_object)

    this[type][key] = healthy_object
    return true;
  },

  /**
   * edits single parameter of a certain object with type, key, and propertyname
   * @param {string} type 
   * @param {string|int} key 
   * @param {string|int} property 
   * @param {any} value 
   * @returns {boolean}
   */
  edit: function (type, key, property, value) {
    if (this.validateType(type) || this.validateKey(type, key) || this.validateProperty(type, property))
      return false;

    this[type][key][property] = value;

    $(document).trigger(`${type}-changed`)
    $(document).trigger(`${type}-edited`, this[type][key])

    return true;
  },

  /**
   * removes an object with type and key
   * @param {string} type 
   * @param {string|int} key 
   * @returns {boolean}
   */
  remove: function (type, key) {
    if (this.validateType(type) || this.validateKey(type, key))
      return false;

    $(document).trigger(`${type}-changed`)
    $(document).trigger(`${type}-removed`, this[type][key])

    delete this[type][key]

    if (this.isEmpty(type))
      $(document).trigger(`${type}-empty`)

    return true;
  },

  /**
   * Deletes all resources of given type
   * @param {string} type 
   */
  empty(type) {
    let iterable = this[type]
    for (let key in iterable)
      this.remove(type, key)
  },

  /**
   * @param {string} type 
   * @returns {boolean}
   */
  isEmpty(type) {
    return Object.keys(this[type]).length == 0;
  },

  // Validators
  validateType(type) {
    if (this[type] === undefined) {
      try {
        throw new TypeNotFound(type)
      } catch (error) {
        console.warn(error.stack)
        return true;
      }
    }
    return false;
  },

  validateProperty(type, property) {
    if (!this['types'][type].includes(property)) {
      try {
        throw new PropertyDoesNotExist(type, property)
      } catch (error) {
        console.warn(error.stack)
        return true;
      }
    }
    return false;
  },

  validateKey(type, key) {
    if (this[type][key] === undefined) {
      try {
        throw new ResourceNotFound(type, key)
      } catch (error) {
        console.warn(error.stack)
        return true;
      }
    }
    return false;
  }
}

class Validator {
  /**
   * Single input validator
   * Error Codes:
   *  0: Healthy
   *  1: Missing Required Field
   *  2: Min Limit Violated
   *  3: Max Limit Violated
   *  4: Regex Pattern Not Matching
   *  5: Not Matching (For Confirmational)
   */

  constructor(input) {
    /**
     * Validator Initialization
     */
    /**
     * Validator Factory
     */
    if (!$(input)[0].hasAttribute('name'))
      throw "Validator Failed: Input has no name attribute"

    this.input = input
    this.fieldName = $(this.input).attr("name")

    this.min = $(this.input).attr('min')
    this.max = $(this.input).attr('max')

    if ($(this.input)[0].hasAttribute('confirm')) {
      this.original = $(this.input).parents('form').find("input[name=" + $(this.input).attr("confirm") + "]")
      if (!this.original.length)
        throw "Confirmational Validation Failed: Original Input Not Found For Input " + $(this.input).attr('confirm')
      this.fieldName = $(this.input).attr('confirm') + " confirmation"
    }
    else {
      if (!$(this.input)[0].hasAttribute('name'))
        throw "Validation Creation Error: input has no attribute name inside form " + $(this.input).parents('form').attr('id')

    }
  }

  getVal() {
    switch ($(this.input).prop("tagName")) {
      case 'TEXTAREA':
      case 'INPUT':
        return $(this.input).val().trim()
      default:
        return $(this.input).val()
    }
  }

  run() {
    /**
     * Validation
     * Error Codes:
     *  0: Healthy
     *  1: Missing Required Field
     *  2: Min Limit Violated
     *  3: Max Limit Violated
     *  4: Regex Pattern Not Matching
     *  5: Not Matching (For Confirmational)
     */

    let input = this.getVal()

    if ($(this.input)[0].hasAttribute("must") && !input)
      return 1 // Required field not filled

    if (this.min && input.length < this.min)
      return 2; // Min Limit Code

    if (this.max && input.length > this.max) {
      $(this.input).val(input.substr(0, this.max))
      return 3; // Max limit Code
    }

    if ($(this.input)[0].hasAttribute("regex")) {
      let regex_string = $(this.input).attr("regex")
      let regex = Regex[regex_string]
      // regex.lastIndex = 0;
      // console.log(regex, input, regex.test(input))
      regex.lastIndex = 0;
      if (!regex.test(input))
        return 4 // Regex Criteria Violated
    }

    if ($(this.input)[0].hasAttribute("confirm")) {
      // Confirmational Validator
      if (input != $(this.original).val()) {
        return 5 // Not Matching Code
      }
    }

    return 0 // Fine Error Code
  }
}

class Validators {
  /**
  * Validators Pool
  * Used for multi-field containers validation
  */
  constructor(container) {
    /**
    * Initialization
    */
    this.initializeValidators(container)
    this.msgContainer = $("[alert=" + $(container).attr('id') + "]")
    if (!this.msgContainer.length)
      console.log($(container).attr('id') + " alert container not found")
  }

  initializeValidators(container) {
    /**
    * Constructing validators
    */
    this.validators = []
    function newValidator(i, input) {
      let validator = new Validator(input)
      if (validator) {
        this.validators.push(validator)

        $(input).on('input', function () {
          this.showMsg(validator, validator.run())
        }.bind(this, validator))
      }
    }
    $(container).find('[name]').each(newValidator.bind(this))
  }

  validateAll() {
    /**
    * All Fields Must Be Healthy
    */
    for (let validator of this.validators) {
      let err = validator.run()
      this.showMsg(validator, err)
      if (err)
        return false
    }
    return true
  }

  showMsg(validator, err) {
    /**
    * Display Error
    */
    let text = validator.fieldName + " Error: "
    switch (err) {
      case 1:
        text += "Required Field"
        break;
      case 2:
        text += "Min Limit is " + validator.min
        break;
      case 3:
        text += "Max Limit is " + validator.max
        break;
      case 4:
        text += "Wrong Pattern!<br>Hover Over the field to view the allowed characters"
        break;
      case 5:
        text += "Not Matching"
        break;
      default:
        text = ""
    }
    $(this.msgContainer).html(text)
  }
}

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

class AJAX {
	/**
	 * Class for customizing AJAX communications by setting default callback functions for ajax requests for improving consistency, centralization, and simplicity.
   * All default callbacks can be simply overriden by specifying new ones on calling AJAX.ajax({...}) just as $.ajax({...})
	 */

	static beforeSend(){
    /**
     * Function that is called before sending ajax requests by default
     */
    // console.log("Request is about to start")
	}

	static complete(xhr, callback) {
		/**
		 * Function that is called after ajax requests are completed by default (called for both success and error status)
		 */

		try {
			xhr.parsed = JSON.parse(xhr.responseText)
		} catch (error) {
			xhr.parsed = {}
		}

		if(typeof(callback) == "function")
			callback(xhr)
	}

	static error(e, options){
    /**
     * Function catches the request failure
     */
    console.log("Fail:", options.data, e.status, e.responseText)
	}

	static success(xhr, callback) {
		/**
		 * Function that handles the success status
		 */

		try {
			xhr.parsed = JSON.parse(xhr.responseText)
		} catch (error) {
			xhr.parsed = {}
		}

		if(callback)
			callback(xhr)
		
	}

	static ajax(options) {
		/**
		 * options must contain url, type, data functions
		 */

		if (options.data instanceof FormData) {
			options.contentType = false;
			options.processData = false;
		}
		
		if (options.beforeSend === undefined)
			options.beforeSend = AJAX.beforeSend()

		let callback = options.complete
		options.complete = function (xhr, status) {
			AJAX.complete(xhr, callback)
		}
			
		let success_callback = options.success
		options.success = function (blah1, blah2, xhr) {
			AJAX.success(xhr, success_callback)
		}

		return $.ajax(options)
	}
}