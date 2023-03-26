syncManager.registerType('session', ['id', 'date', 'time', 'description', 'project_id'])

$(document).on('session-added', function (e, session) {
  $("#no-sessions").hide();

  // Specify group to add this session to it
  let session_date = new Ndate(session.date)
  let description = session.description != null ? session.description : 'no description';

  let diff = session_date.diff(new Ndate())
  let title
  if (diff.days == 0)
    title = 'Today';
  else if (diff.days == 1)
    title = 'Yesterday';
  else
    title = `${diff.days} days ago`;

  // Create new group to add this session if not exists
  if (!$(`div[observe=session] div#sessions-${session_date.toString()}`).length)
    $(`div[observe=session]`).append(`
      <div class="px-4 pt-4 mb-3 sessions-group" id="sessions-${session_date.toString()}">
        <p>${title}</p>
      </div>
    `)

  // Add session to the right group
  $(`div[observe=session] div#sessions-${session_date.toString()}`).append(`
    <div class="card mb-4" data-id="${session.id}" id="session-${session.id}">
      <div class="card-header d-flex justify-content-between" style="color:${syncManager.get('project', session.project_id).color}">
        <span data-name="project_name">${syncManager.get('project', session.project_id).name}</span>
        <i class="bi bi-trash" onclick="deleteSession($(this).closest('.card').attr('id').split('-')[1])"></i>
      </div>

      <div class="card-body">
        <p class="card-title text-center">
          ${session.time}
        </p>
        <p class="card-text d-flex justify-content-between text-secondary"><span>${description}</span><span>${session.date}</span></p>
      </div>
    </div>
  `)
})

$(document).on('session-removed', function (e, session) {
  // Remove session from all observers
  $(`[observe=session] [data-id=${session.id}]`).remove()

  // Remove group if this was the only session existing in it
  if (!$(`div#sessions-${session.date} div`).length)
    $(`div#sessions-${session.date}`).remove()
})

$(document).on('session-empty', function () { $("#no-sessions").show() })

$(document).on('project-removed', function (e, project) {
  let sessions = syncManager.session
  for (let id in sessions)
    if (sessions[id].project_id == project.id)
      syncManager.remove('session', id)
})


// new session ajax
let new_session_form = Form.new($("#new_session_form"))
new_session_form.setCallback(function (xhr) {
  switch (xhr.status) {
    case 200:
      let project = syncManager.get('project', new_session_form.get('project_id'))
      let session = {
        id: xhr.responseText,
        project_id: project.id,
        project_name: project.name,
        color: project.color,
        time: new_session_form.get('time'),
        description: new_session_form.get('description'),
        date: (new Ndate()).toString()
      }

      syncManager.add('session', session)

      save()
      $("#session-desc").modal('hide')
      break;

    default:
      alert("Something went wrong, please refresh")
  }
})


// Timer Flow
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

let session_timer = new Timer($("#timer"))
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
  new_session_form.set('time', session_timer.getTimer())
  new_session_form.set('project_id', $("#session-project_id").val())
}

function save() {
  session_timer.reset()
  $("#start-btn").html('Start').show()
  $("#pause-btn").hide()
  $("#end-btn").attr('disabled', 'disabled')
}

$("#start-btn").click(start)
$("#pause-btn").click(pause)
$("#end-btn").click(end)

function deleteSession(session_id) {
  if (confirm("Are you sure you want to delete this session ?")) {
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
            syncManager.remove('session', session_id)
            break;

          default:
            alert("Something went wrong. Please, reload")
        }
      }
    })
  }
}

window.deleteSession = deleteSession


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
          for (let session of xhr.parsed)
            syncManager.add('session', session)

          break;

        case 204:
          break;

        default:
          alert('Cannot list projects. Please, reload')
      }
    }
  })
}

export { listSessions }