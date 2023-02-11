<?php

class GetSessions extends Authenticated
{
  public function __construct()
  {
    $this->init([], $_GET);
  }

  public function handle(): Response
  {
    return new Response(SUCCESS, SessionMapper::getAllByUser($this->user));
  }
}

function defaultEndpoint(): Endpoint
{
  return new GetSessions();
}
