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
      'project_id' => $this->request['project_id'],
      ' AND ( date = '.$this->request['date'].' and day = "NIL" OR day = "'.$this->request['day'].'" )'
    ]))
      throw new Conflict("Goal already exists");

    try {
      if ($goal = GoalMapper::create($this->request)) {
        return new Response(SUCCESS, $goal->get('id'));
      }
      return new Response(FAIL);
    } catch (ForeignKeyViolated $e) {
      throw new NotFound("Project");
    }
  }
}
