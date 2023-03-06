<?php

class Create extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'project_id' => [true, Regex::ID],
      'amount' => [true, Regex::INT],
      'date' => [true, Regex::DATE],
      'repeat' => [true, Regex::ZERO_ONE]
    ], $_POST);
  }

  public function handle(): Response
  {
    if($this->request['repeat'] == 1)
      $this->request['day'] = (new Ndate($this->request['date']))->getDay(); 

    try {
      if ($goal = GoalMapper::create($this->request))
        return new Response(SUCCESS, [
          'goal_id' => $goal->get('id'),
          'progress' => $goal->get('progress')
        ]);
      return new Response(FAIL);
    } catch (UniquenessViolated $e) {
      throw new Conflict("A Goal Already Exists for That Project");
    } catch (ForeignKeyViolated $e) {
      throw new NotFound("Project");
    }
  }
}
