<template>
  <div class="resume">
    <div class="container">
      <div class="row">
        <div class="col-xs-12">
          <div id="photo-header" class="text-center">
            <!-- PHOTO (AVATAR) -->
            <router-link to="/">
              <div id="photo">
                <div class="home">
                  <i class="fa fa-home fa-3x"></i>
                </div>
                <img src="../assets/logo.png" alt="kenneth pirman">
              </div>
            </router-link>
            <div id="text-header">
              <h1>Hello,<br> I am <span>Kenny Pirman</span>. Here's a few things about me</h1>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12 col-sm-7">
          <!-- ABOUT ME -->
          <div class="box">
            <h2>About Me</h2>
            <p style="padding:0 0 0 15px;">
              I enjoy building modular, service oriented, full stack software solutions for the web.
            </p>
          </div>

          <!-- PROJECTS -->
          <div class="box">
            <h2>Projects</h2>
            <div class="job clearfix">
              <div class="col-xs-3">
                <div class="where">
                  Creator
                </div>
                <div class="year">Berlin</div>
                <div class="year">2017-Present</div>
              </div>
              <div class="col-xs-9">
                <div class="profession"><a href="http://spaceling.io">Spaceling.io</a></div>
                <div class="description">
                	Innovative automated testing tools SaaS
                  Built using <b>AWS lambda functions</b> in conjunction with a <b>Kraken</b> dashboard and a
                  <b>Vue.js</b>-based <b>Chrome extension</b> test recording tool.
                  Key concept involves <b>headlesss browser</b> tech and <b>serverless architecture</b>
                </div>
              </div>
            </div>
            <!-- <div class="job clearfix">
              <div class="col-xs-3">
                <div class="where">
                  Creator
                </div>
                <div class="year">Berlin</div>
                <div class="year">2016-Present</div>
              </div>
              <div class="col-xs-9">
                <div class="profession"><a href="#">SoundPizza</a></div>
                <div class="description">
                	<b>Electron</b> desktop application created with <b>Rust</b> and <b>Javascript</b>. Sends live audio
                  and music to connected web clients using <b>Sockets</b> and <b>Streaming</b> tech
                </div>
              </div>
            </div>
            <div class="job clearfix">
              <div class="col-xs-3">
                <div class="where">
                  Creator
                </div>
                <div class="year">Berlin</div>
                <div class="year">2017-Present</div>
              </div>
              <div class="col-xs-9">
                <div class="profession"><a href="/">Kenny (dot) wtf</a></div>
                <div class="description">
                	An experimental single page appication using ultra-cheap solutions like github pages and 3rd party services.
                  Developed in 3D using <b>WebGL</b> technology with an eye on <b>AR / VR</b>
                </div>
              </div>
            </div>
            -->
          </div>

          <!-- EXPERIENCE -->
          <div class="box">
            <h2>Experience</h2>
            <div class="job clearfix">
              <div class="col-xs-3">
                <div class="where">Private enterprise</div>
                <div class="year">Berlin</div>
                <div class="year">2014 - Present</div>
              </div>
              <div class="col-xs-9">
                <div class="profession">Freelance Software Engineer</div>
                <div class="description">
                	Advising and building with early stage startups on <b>automation</b>, <b>cloud tech</b>, and <b>API integrations</b>,
                  creating <b>microservices and websites</b>
                </div>
              </div>
            </div>
            <div class="job clearfix">
              <div class="col-xs-3">
                <div class="where">Online Gaming Company</div>
                <div class="year">Berlin</div>
                <div class="year">2015 - Present</div>
              </div>
              <div class="col-xs-9">
                <div class="profession">Software Engineer</div>
                <div class="description">
                	Web app, APIs, and microservices design and development.
                	<b>Application architecture</b> research and implementation
                	Building mostly <b>Javascript</b> / <b>Node</b> solutions using <b>Cloud infrastructure.</b><br>
                	Management of projects, milestones, <b>project planning</b> and <b>hiring support </b>. Mentoring peers through <b>workshops</b>.<br>
                	Key concepts in daily work: <b>Single page web-apps, App architecture, microservices, automation </b>
                </div>
              </div>
            </div>

            <div class="job clearfix">
              <div class="col-xs-3">
                <div class="where">BEAM Crowdfunding Education</div>
                <div class="year">Beijing</div>
                <div class="year">2014 - 2015</div>
              </div>
              <div class="col-xs-9">
                <div class="profession">Front-End Engineer</div>
                <div class="description">
                	Development of web applications with <b>Ruby on Rails</b>. Implemented the front-end components of
                  an award-winning crowdfunding platform. Key tech includes <b>cross-browser compatibility</b> for domestic
                  browsers
                </div>
              </div>
            </div>
            <div class="job clearfix">
              <div class="col-xs-3">
                <div class="where">THRE3D</div>
                <div class="year">Beijing</div>
                <div class="year">2013 - 2014</div>
              </div>
              <div class="col-xs-9">
                <div class="profession">3D Printing Consultant</div>
                <div class="description">
                	Work closely with local artists and small businesses to <b>integrate 3D printing technology</b> into their businesses and installations.
                  Develop models using <b>Blender</b> and various 3D printing platforms and tools. Write educational copy. Speak and <b>host
                  tech events</b>
                </div>
              </div>
            </div>
          </div>

          <!-- EDUCATION -->
          <div class="box">
            <h2>Education</h2>
            <ul id="education" class="clearfix">
              <li>
                <div class="year pull-left">2012</div>
                <div class="description pull-right">
                  <h3>B.A. Linguistics, The University of Texas at Austin</h3>
                  <p>Specialized in Chinese Film & Linguistics</p>
                </div>
              </li>
              <li>
                <div class="year pull-left">2011</div>
                <div class="description pull-right">
                  <h3>CET Chinese Language Program</h3>
                  <p>Research topic: Chinese Poetry</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
        <div class="col-xs-12 col-sm-5">
          <!-- CONTACT -->
          <div class="box clearfix">
            <h2>Contact</h2>
            <div class="contact-item">
              <div class="icon pull-left text-center"><i class="fa fa-phone fa-fw"></i></div>
              <div class="title only pull-right">+4915732964692</div>
            </div>
            <div class="contact-item">
              <div class="icon pull-left text-center"><i class="fa fa-envelope fa-fw"></i></div>
              <div class="title only pull-right">
                <a href="mailto:hello@kenny.wtf">hello@kenny.wtf</a>
              </div>
            </div>
            <div class="contact-item">
              <div class="icon pull-left text-center"><i class="fa fa-twitter fa-fw"></i></div>
              <div class="title pull-right">Twitter</div>
              <div class="description pull-right">
                <a href="https://twitter.com/kenny_pizza">https://twitter.com/kenny_pizza</a>
              </div>
            </div>
            <div class="contact-item">
              <div class="icon pull-left text-center"><i class="fa fa-github fa-fw"></i></div>
              <div class="title pull-right">Github</div>
              <div class="description pull-right">
                <a href="https://github.com/kenjinp">https://github.com/kenjinp</a>
              </div>
            </div>
            <div class="contact-item">
              <div class="icon pull-left text-center"><i class="fa fa-linkedin-square fa-fw"></i></div>
              <div class="title pull-right">LinkedIn</div>
              <div class="description pull-right">
                <a href="https://www.linkedin.com/in/kenjinp/">https://www.linkedin.com/in/kenjinp/</a>
              </div>
            </div>
            <!--<div class="contact-item">
              <div class="icon pull-left text-center"><i class="fa fa-home fa-fw"></i></div>
              <div class="title pull-right">Blog & Experiments</div>
              <div class="description pull-right">
                <a href="http://kenny.wtf">http://kenny.wtf</a>
              </div>
            </div>-->
          </div>

          <!-- KNOWLEDGE POOL -->
          <div class="box">
            <h2>Knowledge Pool</h2>
            <div class="know default">Node</div>
            <div class="know default">AWS</div>
            <div class="know default">Ruby</div>
            <div class="know default">React</div>
            <div class="know default">Vue.js</div>
            <div class="know default">Serverless</div>
            <div class="know default">Chrome Extensions</div>
            <div class="know default">Electron Apps</div>
            <div class="know default">Highspeed APIs</div>
            <div class="know default">WebGL</div>
            <div class="know default">Backend development</div>
            <div class="know default">Microservice Architecture</div>
            <div class="know default">ExpressJS</div>
            <div class="know default">Kraken</div>
            <div class="know default">REST APIs</div>
            <div class="know default">MongoDB</div>
            <div class="know default">NOSQL</div>
            <div class="know default">PostgreSQL</div>
            <div class="know default">Unix</div>
            <div class="know default">Redis</div>
            <div class="know default">Ruby on Rails</div>
            <div class="know default">GIT</div>
            <div class="know default">Unix</div>
            <div class="know default">eCommerce</div>
            <div class="know default">Continuous Integration</div>
            <div class="know default">TDD</div>
            <div class="know default">OOP</div>
          </div>

          <!-- SKILLS -->
          <div class="box">
            <h2>Top Skills</h2>
            <div class="skills" style="overflow: auto;">
              <div class="item-skills" data-percent="1.00" style="width: 400px;">Frontend Development</div>
              <div class="item-skills" data-percent="1.00" style="width: 320px;">Backend Development</div>
              <div class="item-skills" data-percent="0.90" style="width: 240px;">APIs and Microservices</div>
              <div class="item-skills" data-percent="0.70" style="width: 240px;">Automation & Testing</div>
              <div class="item-skills" data-percent="0.70" style="width: 200px;">Cloud & DevOps</div>
              <div class="skills-legend clearfix" style="width:400px">
                <div class="legend-left legend">Beginner</div>
                <div class="legend-left legend"><span>Proficient</span></div>
                <div class="legend-right legend"><span>Expert</span></div>
                <div class="legend-right legend">Master</div>
              </div>
            </div>
          </div>
          <!-- LANGUAGES -->
          <div class="box">
            <h2>Languages</h2>
            <div id="language-skills">
              <div class="skill">English <div class="icons pull-right"><div style="width: 100%; height: 14px;" class="icons-red"></div></div></div>
              <div class="skill">Chinese <div class="icons pull-right"><div style="width: 95%; height: 14px;" class="icons-red"></div></div></div>
              <div class="skill">German <div class="icons pull-right"><div style="width: 40%; height: 14px;" class="icons-red"></div></div></div>
            </div>
          </div>
          <!-- HOBBIES -->
          <div class="box">
            <h2>Hobbies</h2>
            <div class="hobby">Film</div>
            <div class="hobby">Running</div>
            <div class="hobby">Reading (everything)</div>
            <div class="hobby">Board Games & Beer</div>
            <div class="hobby">Dungeons & Dragons (lvl 6 monk)</div>
            <div class="hobby">Programming</div>
            <div class="hobby">Cycling</div>
            <div class="hobby">Travelling</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResumeView'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  box-shadow: 2px 8px 10px 0px #c38583;
}
h1, h2 {
  font-weight: normal;
}

#photo {
  overflow: visible;
  position: relative;
}

#photo:hover .home {
  font-size: 16px;
  padding: 6px;
}

.home {
  position: absolute;
  bottom: 10px;
  font-size: 13px;
  right: 0;
  background-color: white;
  border-radius: 50%;
  padding: 4px;
  color: #f3928e;
  transition: all 0.3s ease;
}

#photo img {
  border-radius: initial;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #363636;
  text-decoration: underline;
}
</style>
