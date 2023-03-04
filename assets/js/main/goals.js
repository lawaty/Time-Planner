syncManager.registerType('goal')

document.addEventListener('goal-added', function (e) {
  let goal = e.added

  $("#goals-list").append(`
  <li class="mb-3 goal" id="goal-${goal.id}">
    <div class="d-flex justify-content-between">
      <span style="color:${rgb2hex($("#new_goal_form select option:selected").css('color'))}">
        ${$("#new_goal_form select option:selected").html()}
      </span>
      <i class="bi bi-trash" onclick="deleteGoal($(this).closest('.goal').attr('id').split('-')[1])"></i>
    </div>

    <div class="progress my-2" style="position:relative;height:30px;">
      <div class="progress-bar" role="progressbar" style="width:0%;background-color:#03a9f4;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      <p class="w-100 h-100 d-absolute d-flex justify-content-center align-items-center" style="position:absolute">${$("#new_goal_form input[name=time]").val()} minutes</p>
    </div>
  </li>
`)
})

// new_goal_form = Form.new($("#new_goal_form"))
// new_goal_form.setCallback(function (xhr) {
//   switch (xhr.status) {
//     case 409:
//       alert('Goal Already Exists For This Project')
//       break;

//     case 200:


//       $("#new-goal-modal").modal('hide')
//       break;

//     default:
//       alert("Something went wrong, please refresh")
//   }
// })