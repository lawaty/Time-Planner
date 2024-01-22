<?php

class Edit extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'goal_id' => [true, Regex::ID],
      'project_id' => [false, Regex::ID],
      'amount' => [false, Regex::HEX],
      'date' => [false, Regex::DATE],
      'day' => [false, Regex::DAY],
      'repeat' => [false, Regex::ZERO_ONE]
    ], $_POST);
  }

  public function handle(): Response
  {
    if (count($this->request) < 2)
      throw new BadRequest("Nothing To Change");

    if (!$goal = GoalMapper::getByUser($this->user, ['id' => $this->request['goal_id']]))
      throw new NotFound("Goal");

    unset($this->request['goal_id']);
    foreach ($this->request as $key => $value)
      $goal->set($key, $value);

    try {
      $goal->getMapper()->save();
      return new Response(SUCCESS);
    } catch (ForeignKeyViolated $e) {
      throw new NotFound("Goal");
    } catch (Exception $e) {
      throw new Fail;
    }
  }
}
