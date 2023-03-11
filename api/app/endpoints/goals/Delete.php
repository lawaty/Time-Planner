<?php

class Delete extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'goal_id' => [true, Regex::ID]
    ], $_POST);
  }

  public function handle(): Response
  {
    if(!$goal = GoalMapper::getByUser($this->user, ['goals.id' => $this->request['goal_id']]))
      throw new NotFound('Goal');
    
    if(!$goal->getMapper()->delete())
      throw new Fail();

    return new Response(SUCCESS);
  }
}