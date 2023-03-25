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
    if ($this->request['repeat'] == 1)
      $this->request['day'] = (new Ndate($this->request['date']))->format('D');
    else
      $this->request['day'] = 'NIL';

    if (GoalMapper::get([
      'date' => $this->request['date'],
      'day' => $this->request['day']
    ]))
      throw new Conflict("Goal already exists");

    try {
      if ($goal = GoalMapper::create($this->request)) {
        var_dump($goal->get('id'));
        return new Response(SUCCESS, $goal->get('id'));
      }
      return new Response(FAIL);
    } catch (ForeignKeyViolated $e) {
      throw new NotFound("Project");
    }
  }
}
