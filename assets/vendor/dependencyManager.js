class Manager{
  /**
   * Manages importing scripts and components
   * Singleton
   */
  static stRoot = "/Time-Planner"
  
  constructor(root=false){
    this.dependencies = []
    this.root = root ? root : Manager.stRoot
  }

  dependencyExists(path){
    return this.dependencies.includes(path)
  }

  #importJs(path){
    let file_name = path.substr(path.lastIndexOf('/')+1).split('.')[0]
    $("body").append(`
      <script id="`+file_name+`Script" src="`+path+`"></script>
    `)
    
  }

  #importCss(path){
    $("head").append(
      `<link rel="stylesheet" href="`+path+`">`
    )
  }

  #importHtml(path, callback){
    let fileIdentifier = path.substr(path.lastIndexOf('/')+1).split('.')[0]
    let place = $("[component="+fileIdentifier+"]");
    if($(place).length)
      $(place).load(path, callback)
    
    else 
      throw "Importing "+path+" Failed: container not found";
  }

  importFile(dependency, callback){
    /**
     * Importing Single File (if not imported previosuly)
     * @param dependency: path to file
     */

    let filename = dependency.substr(dependency.lastIndexOf('/')+1)
    if(this.dependencyExists(dependency))
      return

    switch(filename.split('.')[1]){
      case "js":
        this.#importJs(dependency)
        break;

      case "css":
        this.#importCss(dependency)
        break;
      
      case "html":
        this.#importHtml(dependency, callback)
        break;
    }

    this.dependencies.push(dependency)
  }

  importGComponent(component){
    /**
     * Importing Componenet Files
     * @param component: component name
     */
    let htmlPath = this.root+"/components/"+component+"/"+component+".html"
    let jsPath = this.root+"/components/"+component+"/"+component+".js"
    let cssPath = this.root+"/components/"+component+"/"+component+".css"

    this.importFile(
      htmlPath, 
      this.importFile.bind(this, jsPath)
    )
    this.importFile(cssPath) 
  }

  importComponent(component){
    /**
     * Importing Componenet Files
     * @param component: component name
     */
    let htmlPath = component+"/"+component+".html"
    let jsPath = component+"/"+component+".js"
    let cssPath = component+"/"+component+".css"

    this.importFile(
      htmlPath,
      this.importFile.bind(this, jsPath)
    )

    this.importFile(cssPath)
  }

  import(dependencies, reference=this.root){
    /**
     * Imports multiple files and components at once
     * @param dependencies: list of paths for files and component names
     */
    for(let dependency of dependencies){
      if(dependency.indexOf('.') == -1)
        this.importComponent(dependency)
              
      else{
        if(reference.length)
          dependency = reference+"/"+dependency
        this.importFile(dependency)
      }
    }
  }
}