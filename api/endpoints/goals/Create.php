<?php

class Create extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'project_id' => [true, Regex::ID],
      'time' => [true, Regex::INT]
    ], $_POST);
  }

  public function handle(): Response
  {
    try {
      if ($goal = GoalMapper::create([
        'project_id' => $this->request['project_id'],
        'time' => $this->request['time']
      ]))
        return new Response(SUCCESS, [
          'goal_id' => $goal->get('id')
        ]);

      return new Response(FAIL);
    } catch (UniquenessViolated $e) {
      throw new Conflict("A Goal Already Exists for That Project");
    } catch (ForeignKeyViolated $e) {
      throw new NotFound("Project");
    }
  }
}
