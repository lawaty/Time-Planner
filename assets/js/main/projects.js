syncManager.registerType('project', ['id', 'name', 'color'])

document.addEventListener('project-added', function (e) {
  let project = e.added

  $("ul[observe=projects]").append(`
    <li style="color:${project.color}" id="project-${project.id}">${project.name}<i class="bi bi-trash" onclick="deleteProject($(this).parent().attr('id).split('-')[1])"></i></li>
  `)

  $("select[observe=projects]").append(`
    <option style="color:${project.color}" value="${project.id}">${project.name}</option>
  `)
})

document.addEventListener('project-removed', function (e) {
  let project = e.removed

  $(`ul[observe=projects] li#project-${project.id}`).remove()
  $(`select[observe=projects] option#project-${project.id}`).remove()
})

let new_project_form = Form.new($("#new_project_form"))
new_project_form.setCallback(function (xhr) {
  switch (xhr.status) {
    case 200:
      let project = {
        id: xhr.responseText,
        color: new_project_form.get('color'),
        name: new_project_form.get('name'),
      }

      syncManager.add('project', project)

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
})

AJAX.ajax({
  url: "api/projects",
  type: "GET",
  data: {
    token: local.get('token')
  },
  complete: function (xhr) {
    switch (xhr.status) {
      case 200:
        for (let project of xhr.parsed)
          syncManager.add('project', project)

        break;

      case 204:
        break;

      default:
        alert('Cannot list projects. Please, reload')
    }
  }
})

function deleteProject(project_id) {
  if (confirm("Are you sure you want to delete this project ?")) {
    AJAX.ajax({
      url: "api/projects/delete",
      type: "POST",
      data: {
        token: local.get('token'),
        project_id: project_id
      },
      complete: function (xhr) {
        switch (xhr.status) {
          case 200:
          case 204:
            syncManager.remove('project', project_id)
            break;

          default:
            alert("Something went wrong. Please, reload")
        }
      }
    })
  }
}