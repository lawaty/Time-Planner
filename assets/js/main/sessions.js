syncManager.registerType('session', ['id', 'date', 'time', 'description', 'color', 'project_name'])

document.addEventListener('session-added', function (e) {
  let session = e.added

  $("#no-sessions").hide();

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

  if (!$(`div[observe=sessions] div#sessions-${session_date.toString()}`).length)
    $(`div[observe=sessions]`).append(`
      <div class="p-4 mb-3 sessions-group" id="sessions-${session_date.toString()}">
        <h4>${title}</h4>
      </div>
    `)

  $(`div[observe=sessions] div#sessions-${session_date.toString()}`).append(`
    <div class="card mb-4" data-id="${session.id}" id="session-${session.id}">
      <div class="card-header d-flex justify-content-between" style="color:${session.color}">
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
})

document.addEventListener('session-removed', function (e) {
  let session = e.removed
  $(`[observe=sessions] [data-id=${session.id}]`).remove()

  if(!$(`div#sessions-${session.date} div`).length)
    $(`div#sessions-${session.date}`).remove()
})

document.addEventListener('session-empty', function() {$("#no-sessions").show()})

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

window.deleteSession = deleteSession;