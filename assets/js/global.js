let local = {
  get: function (key) {
    let result = localStorage.getItem(key)
    if (result !== null)
      return result
    return false
  },
  set: function (key, value) {
    localStorage.setItem(key, value)
  },
  remove: function (key) {
    localStorage.removeItem(key)
  }
};

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
      key = object.id

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

    let event = new Event(`${type}-added`)
    event.added = healthy_object
    document.dispatchEvent(event)

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

    let event = new Event(`${type}-removed`)
    event.removed = this[type][key]
    document.dispatchEvent(event)
    delete this[type][key]

    if (this.isEmpty(type)) {
      let event = new Event(`${type}-empty`)
      document.dispatchEvent(event)
    }

    return true;
  },

  /**
   * Deletes all resources of given type
   * @param {string} type 
   */
  empty(type) {
    let iterable = this[type]
    for (let key in iterable)
      syncManager.remove(type, key)
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
    if (!this[types][type].includes(property)) {
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
  INT: /^[0-9]+$/,
  SINT: /^-?[0-9]+$/,
  ZERO_ONE: /^[0-1]$/,

  MONTH: /^([1-9]|1[0-2])$/,
  DATE: /^(\d{4})-(\d{2})-(\d{2})$/,
  TIME: /^[0-9]{2}:[0-9]{2}$/,
  DATE_TIME: /^(\d{4})-(\d{2})-(\d{2}) [0-9]{2}:[0-9]{2}$/,
  DATE_TIME_SEC: /^(\d{4})-(\d{2})-(\d{2}) [0-9]{2}:[0-9]{2}:[0-9]{2}$/,
  DAY_TIME: /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) [0-9]{2}:[0-9]{2}$/,

  JWT: /^[\w-]*\.[\w-]*\.[\w-]*$/,
  LOGIN: /^[\p{Script=Arabic}\w\-. ]+$/gu,
  EMAIL: /^[\w_\-.]+@[\w]+\.[\w]+$/,
  NAME: /^[\p{Script=Arabic}\w ]+$/gu,
  PHONE: /^\+?[0-9]+$/,
  GRADE: /^([1-9]|1[0-2])$/,

  GENERIC: /^[\p{Script=Arabic}\w_\-\)\(. +]+$/gu,
  ANY: /^.*$/,
}

let page = window.location.pathname.split('/').pop()
// Need to sign in
if (page != 'membership' && page != 'membership.html' && (!local.get('token') || !local.get('id'))) {
  local.remove('token')
  local.remove('id')
  window.location = "membership";
}

// Already signed in
if ((page == 'membership' || page == 'membership.html') && local.get('token') && local.get('id')) {
  window.location = "home"
}

class Timer {
  constructor(container = null) {
    this.secs = 0
    this.mins = 0
    this.hrs = 0

    this.container = container

    this.started = false;
  }

  run() {
    this.secs++

    if (this.secs == 60) {
      this.secs = 0
      this.mins++

      if (this.mins == 60) {
        this.mins = 0
        this.hrs++
      }
    }

    if (this.container !== null)
      this.display()
  }

  display() {
    $(this.container).html(this.getTimer())
  }

  getTimer() {
    let hours = this.hrs < 10 ? '0' + this.hrs : this.hrs
    let minutes = this.mins < 10 ? '0' + this.mins : this.mins
    let seconds = this.secs < 10 ? '0' + this.secs : this.secs

    return `${hours}:${minutes}:${seconds}`
  }

  start() {
    if (!this.started) {
      this.interval = setInterval(function () { this.run() }.bind(this), 1000)
      this.started = true;
    }
  }

  pause() {
    clearInterval(this.interval);
    this.started = false;
  }

  reset() {
    clearInterval(this.interval)
    this.secs = 0
    this.mins = 0
    this.hrs = 0

    if (this.container)
      this.display()

    this.started = false;
  }
}

class Ndate extends Date {
  static weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  constructor(a, b, c) {
    switch (arguments.length) {
      case 0:
        super();
        break;
      case 1:
        super(a);
        break;
      case 2:
        super(a, b);
        break;
      case 3:
        super(a, b, c);
        break;
    }
  }

  addDays(num_of_days) {
    this.setDate(this.getDate() + num_of_days);
    return this;
  }

  addWeeks(num_of_weeks) {
    this.setDate(this.getDate() + num_of_weeks * 7);
    return this;
  }

  addMonths(num_of_months) {
    this.setMonth(this.getMonth() + num_of_months)
    this.setDate(1);
    return this;
  }

  toString() {
    const offset = this.getTimezoneOffset()
    let temp = new Ndate(this.getTime() - (offset * 60 * 1000))
    return temp.toISOString().split('T')[0]
  }

  diff(date) {
    /**
     * @param date:Ndate
     */

    return new NdateInterval(Math.abs(date - this))
  }

  firstDayOfMonth() {
    return new Ndate(this.getFullYear(), this.getMonth(), 1).getDay()
  }

  lastDayOfMonth() {
    return new Ndate(this.getFullYear(), this.getMonth() + 1, 0).getDate()
  }

  sameDate(date) {
    return date.getFullYear() == this.getFullYear() &&
      date.getMonth() == this.getMonth() &&
      date.getDate() == this.getDate();
  }
}

class NdateInterval {
  constructor(milliseconds) {
    this.total_millis = milliseconds;

    this.days = parseInt(milliseconds / 86400000);
    milliseconds -= this.days * 86400000;

    this.hours = parseInt(milliseconds / 3600000);
    milliseconds -= this.hours * 3600000;

    this.minutes = parseInt(milliseconds / 60000);
    milliseconds -= this.minutes * 60000;

    this.seconds = parseInt(milliseconds / 1000);

    this.milliseconds -= this.seconds * 1000;

    Object.preventExtensions()
  }
}