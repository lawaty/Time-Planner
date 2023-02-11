<?php

class GetProjects extends Authenticated
{
  public function __construct()
  {
    $this->init([], $_GET);
  }

  public function handle(): Response
  {
    return new Response(SUCCESS, ProjectMapper::getAllByUser($this->user));
  }
}

function defaultEndpoint(): Endpoint
 {
  return new GetProjects();
}