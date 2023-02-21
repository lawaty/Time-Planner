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

let new_project_form, new_session_form, new_goal_form, session_timer
(function () {
  new_project_form = Form.new($("#new_project_form"))
  new_session_form = Form.new($("#new_session_form"))
  new_goal_form = Form.new($("#new_goal_form"))

  listProjects()
  listSessions()
  listGoals() 

  $("[name=token]").val(local.get('token'))

  session_timer = new Timer($("#timer"))
})()

function new_project_callback(xhr) {
  switch (xhr.status) {
    case 200:
      $("#projects-list").append(`<li style="color:${$("#new_project_form [name=color]").val()};" id="project-${xhr.parsed.id}">${$("#new_project_form [name=name]").val()}<i class="bi bi-trash" onclick="deleteProject($(this).parent())"></i></li>`)

      $("#select-project").append(`
        <option style="color:${$("#new_project_form [name=color]").val()}" value="${xhr.responseText}">${project.name}</option>
      `)

      if (!$("#projects-list").hasClass('show'))
        $("[data-bs-target='#projects-list']").click()

      $("#new-project-modal").modal('hide')
      break;

    case 409:
      if (xhr.responseText.includes("color"))
        alert("project color already selected for another project")
      else if (xhr.responseText.includes("name"))
        alert("project name already exists for another project")
      break;

    default:
      alert("Couldn't create project")
  }
}

function new_session_callback(xhr) {
  switch (xhr.status) {
    case 200:
      $("#sessions-list").append(`
        <div class="card mb-4" id="session-${xhr.responseText}">
          <div class="card-header d-flex justify-content-between" style="color:${rgb2hex($("#select-project").find(":selected").css('color'))}">
            <span>${$("#select-project").find(":selected").text()}</span>
            <i class="bi bi-trash" onclick="deleteSession($(this).closest('.card').attr('id').split('-')[1])"></i>
          </div>

          <div class="card-body">
            <h4 class="card-title text-center">
              ${$("#new_session_form [name=time]").val()}
            </h4>
            <p class="card-text d-flex justify-content-between text-secondary"><span>${$("#new_session_form [name=description]").val()}</span><span>${(new Ndate()).toString()}</span></p>
          </div>
        </div>
      `)

      save()

      $("#session-desc").modal('hide')
      break;

    default:
      alert("Something went wrong, please refresh")
  }
}

function start() {
  session_timer.start()
  $("#start-btn").hide()
  $("#pause-btn").show()
  $("#end-btn").removeAttr('disabled')
}

function pause() {
  session_timer.pause()
  $("#start-btn").html('Resume').show()
  $("#pause-btn").hide()
}

function end() {
  pause()

  $("#session-desc").modal('show')
  $("#session-desc [name=time]").val(session_timer.getTimer())
  $("#session-desc [name=project_id]").val($("#select-project").val())
}

function save() {
  session_timer.reset()
  $("#start-btn").html('Start').show()
  $("#pause-btn").hide()
  $("#end-btn").attr('disabled', 'disabled')
}

function logout() {
  local.remove("id")
  local.remove("token")
  window.location.href = "membership"
}

function listProjects() {
  AJAX.ajax({
    url: "api/projects",
    type: "GET",
    data: {
      token: local.get('token')
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          for (let project of xhr.parsed) {
            $("#projects-list").append(`
            <li style="color:${project.color};" id="project-${project.id}">${project.name}<i class="bi bi-trash" onclick="deleteProject($(this).parent())"></i></li>`)

            $("main #select-project, #new_goal_form #select-project").append(`
              <option style="color:${project.color}" value="${project.id}">${project.name}</option>
            `)
          }
          break;

        case 204:
          break;

        default:
          alert('Cannot list projects. Please, reload')
      }
    }
  })
}
let session_date;
function listSessions() {
  AJAX.ajax({
    url: "api/sessions",
    type: "GET",
    data: {
      token: local.get('token')
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          let list_title = '';
          for (let session of xhr.parsed) {
            let diff = (new Ndate(session.date)).diff(new Ndate())
            let title
            if (diff.days == 0)
              title = 'Today';
            else if (diff.days == 1)
              title = 'Yesterday';
            else
              title = `${diff.days} days ago`;

            let description = session.description != null ? session.description : 'no description';

            if (list_title != title) {
              $("#sessions-list").append(`<h3 class="text-secondary mb-4 ml-3">${title}</h3>`);
              list_title = title;
            }

            $("#sessions-list").append(`
              <div class="card mb-4" id="session-${session.id}">
                <div class="card-header d-flex justify-content-between" style="color:${session.project_color}">
                  <span>${session.project_name}</span>

                  <i class="bi bi-trash" onclick="deleteSession($(this).closest('.card').attr('id').split('-')[1])"></i>
                </div>
                <div class="card-body">
                  <h4 class="card-title text-center">
                    ${session.time}
                  </h4>
                  <p class="card-text d-flex justify-content-between text-secondary"><span>${description}</span><span>${session.date}</span></p>
                </div>
              </div>
            `)
          }
          break;

        case 204:
          break;

        default:
          alert('Cannot list projects. Please, reload')
      }
    }
  })
}

function listGoals() {
  AJAX.ajax({
    url: "api/goals",
    type: "GET",
    data: {
      token: local.get('token')
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          for (let goal of xhr.parsed) {
            $("#goals-list").append(`
              <div class="mb-3" id="goal-${goal.id}">
                <div class="d-flex justify-content-between">
                  <span style="color:${goal.project_color}">
                    ${goal.project_name}
                  </span>
                  <i class="bi bi-trash" onclick="deleteSession($(this).closest('.card').attr('id').split('-')[1])"></i>
                </div>

                <div class="progress">
                  <div class="progress-bar" role="progressbar" style="width: ${goal.percent}%; background-color: ${goal.project_color}" aria-valuenow="${goal.percent}" aria-valuemin="0" aria-valuemax="100">${goal.percent}%</div>
                  <p class="w-100 text-center">${parseInt(((100 - goal.percent) / 100) * goal.goal_time)} minutes</p>
                </div>

              </div>
            `)
          }
          break;

        case 204:
          break;

        default:
          alert('Cannot list goals. Please, reload')
      }
    }
  })
}

function deleteProject(li) {
  if (confirm("Are you sure you want to delete this project ?")) {
    AJAX.ajax({
      url: "api/projects/delete",
      type: "POST",
      data: {
        token: local.get('token'),
        project_id: $(li).attr('id').split('-')[1]
      },
      complete: function (xhr) {
        switch (xhr.status) {
          case 200:
          case 204:
            $(li).remove()
            break;

          default:
            alert("Something went wrong. Please, reload")
        }
      }
    })
  }
}

function deleteSession(session_id) {
  if (confirm("Are you sure you want to delete this session?")) {
    AJAX.ajax({
      url: "api/sessions/delete",
      type: "POST",
      data: {
        token: local.get('token'),
        session_id: session_id
      },
      complete: function (xhr) {
        switch (xhr.status) {
          case 200:
          case 204:
            $(`#session-${session_id}`).remove()
            break;

          default:
            alert("Something went wrong. Please, reload")
        }
      }
    })
  }
}

function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

var hexDigits = new Array
  ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"); 