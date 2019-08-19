import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { FormGroup ,FormBuilder  } from '@angular/forms';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit {
  registerForm: FormGroup;
  students : any = [{ id: 0, name :"Placeholder", grade : 0,quiz  : ["00"]}];
  headElements = ['Name','ID','Quiz','Password','Period','Queue','Average','Enabled','','',''];
  boolTable : any = [false]
  periodList : any;
  periodID : any;
  nameChg : any;
  periodChg : any;
  enabledChg : Boolean = true;
  day : any;
  

  topics = ['Fraction Operations','Fraction-Decimal-Percent',
  'Rounding','Add Integers','Subtract Integers','Multiply Integers',
  'Divide Integers','Unit Rate','Equivalent Ratios','Percent','Evalute Expressions'
  ,'Algebra-Words Translation','Simplify Expressions','1-Step Equations','2-Step  Equations']

  constructor(private auth : AuthService,
     private router : Router,
     private formBuilder: FormBuilder,
      private user: UserService) { }

  ngOnInit() { //On init, check to make sure user is admin, then get all students info
    this.registerForm = this.formBuilder.group({
      name: [''],
      period: ['']
    });
    this.auth.checkLogged().subscribe(data=>{
      if (data.success === false){
        this.router.navigate(['login'])
      } else {
        if(data.message == "admin"){
          this.boolTable = [false]
          this.user.getUser().subscribe(data =>{
            this.periodList = data.period.answers
            this.students = data.students
            this.periodID = this.periodList[0]
            this.day = data.order.day
            for (var i = 0; i < this.students.length; i++){
              this.boolTable[i] = false
            }  
          });
        }else{
          this.router.navigate(['login'])
        }
      }
    })
  }

  get f() { return this.registerForm.controls; }

  onSubmit(){
    const name = this.f.name.value
    var period = this.f.period.value
    if(!period){
      period = this.periodList[0]
    }
    if(!name){
      window.alert('Enter a Name')
      return
    }
    this.user.register(name,period).subscribe(() =>
     this.updateList());
     window.alert('Student Created!')
  }

  reset(){
    if(prompt('You are trying to RESET EVERYTHING. Please note this cannot be undone!\nPlease type "reset everything" for security') === ("reset everything")){
      this.user.reset().subscribe(() => {
        window.alert('Year Reset')
        this.updateList()
      })
    }else{
      window.alert("Invalid Confirmation");
    }
  }

  calculate(){
    if(prompt('You are trying to END MARKING PERIOD.\nMake sure to do this on the FIRST DAY OF THE NEXT MARKING PERIOD!\nPlease type "end marking period" for security') === ("end marking period")){
      this.user.calculate().subscribe((data) => {
        window.alert(data.message)
        this.updateList();
      })
    }else{
      window.alert("Invalid Confirmation");
    }
  }

  registerUser(event) {
    const target = event.target
    const username = "blank"
    const period = target.querySelector('#period').value
    if (period){
      this.periodID = period
      this.user.register(username,period).subscribe(() =>
        this.updateList());
      window.alert('Period Created!')
    }else{
      window.alert('Please Enter a Period Name')
    }
  }

  removeStudent(userID,name){
    if(prompt('You are trying to DELETE ' + name + '\nPlease type "delete ' + name + '" for security') === ("delete " + name)){
      this.user.delete(userID).subscribe(() =>
      this.updateList());
      window.alert('Student Deleted!')
    }else{
      window.alert("Invalid Confirmation");
    }
  }

  updateList(){
    this.boolTable = [false]
    this.user.getUser().subscribe(data =>{
      this.periodList = data.period.answers
      this.students = data.students
      this.day = data.order.day
      for (var i = 0; i < this.students.length; i++){
        this.boolTable[i] = false
      }
      for (var i = 0; i < this.periodList.length; i++){
        if (this.periodList[i] == this.periodID)
          return
      }
      this.periodID = this.periodList[0]
    });
  }

  lastPeriod(){
    var index = this.periodList.indexOf(this.periodID)
    index -= 1
    if (index == -1){
      index = this.periodList.length - 1
    }
    this.periodID = this.periodList[index]
  }

  nextPeriod(){
    var index = this.periodList.indexOf(this.periodID)
    index += 1
    if (index == this.periodList.length){
      index = 0
    }
    this.periodID = this.periodList[index]
  }

  deletePeriod(){
    for (var i = 0; i < this.students.length; i++){
      if (this.students[i].period == this.periodID){
        window.alert('Period Not Empty!')
        return
      }
    }
    if(prompt('You are trying to DELETE ' + this.periodID + '\nPlease type "delete ' + this.periodID + '" for security') === ("delete " + this.periodID)){
      this.user.deletePeriod(this.periodID).subscribe(() => {
        this.updateList()
        window.alert('Period Deleted')
      });
    }else{
      window.alert("Invalid Confirmation");
    }
  }

  modify(index){
    for (var i = 0; i < this.boolTable.length; i++){
      if (this.boolTable[i]){
        return
      }
    }
    this.boolTable[index] = true
  }

  update(index,name){
    if(prompt('You are trying to EDIT ' + name + '\nPlease type "edit ' + name + '" for security') === ("edit " + name)){
      if(!this.nameChg){
        this.nameChg = this.students[index].user
      }
      if(!this.periodChg){
        this.periodChg = this.students[index].period
      }
      console.log(this.enabledChg)
      this.user.editUser(this.nameChg,this.periodChg,this.enabledChg,this.students[index]._id).subscribe(() => this.updateList());
    }else{
      window.alert("Invalid Confirmation");
    }
    this.boolTable[index] = false
    this.nameChg = null
    this.periodChg = null
  }

  advanceDay(){
    if(prompt('You are trying to ADVANCE DAY' + '\nPlease type "advance day" for security') === ("advance day")){
      this.user.advance().subscribe(data =>{
        window.alert(data.message);
        this.updateList();
      })
    }else{
      window.alert("Invalid Confirmation");
    }
  }
  
}
