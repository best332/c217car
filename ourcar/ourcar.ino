

int Left_motor_go=8;     //左电机前进(IN1)
int Left_motor_back=9;     //左电机后退(IN2)

int Right_motor_go=10;    // 右电机前进(IN3)
int Right_motor_back=11;    // 右电机后退(IN4)

bool bluetoothstate= true;
int now;
void setup()
{
  //初始化电机驱动IO为输出方式
   Serial.begin(9600);
  pinMode(Left_motor_go,OUTPUT); // PIN 8 (PWM)
  pinMode(Left_motor_back,OUTPUT); // PIN 9 (PWM)
  pinMode(Right_motor_go,OUTPUT);// PIN 10 (PWM) 
  pinMode(Right_motor_back,OUTPUT);// PIN 11 (PWM)
}
void run(int time)     // 前进
{
  digitalWrite(Right_motor_go,HIGH);  // 右电机前进
  digitalWrite(Right_motor_back,LOW);     
  analogWrite(Right_motor_go,200);//PWM比例0~255调速，左右轮差异略增减
  analogWrite(Right_motor_back,0);
  digitalWrite(Left_motor_go,LOW);  // 左电机前进
  digitalWrite(Left_motor_back,HIGH);
  analogWrite(Left_motor_go,0);//PWM比例0~255调速，左右轮差异略增减
  analogWrite(Left_motor_back,200);
  delay(time * 100);   //执行时间，可以调整  
}

void brake(int time)         //刹车，停车
{
  digitalWrite(Right_motor_go,LOW);
  digitalWrite(Right_motor_back,LOW);
  digitalWrite(Left_motor_go,LOW);
  digitalWrite(Left_motor_back,LOW);
  delay(time * 100);//执行时间，可以调整  
}

void left(float time)         //左转(左轮后退，右轮前进)
{
   digitalWrite(Right_motor_go,HIGH);	// 右电机前进
  digitalWrite(Right_motor_back,LOW);
  analogWrite(Right_motor_go,200); 
  analogWrite(Right_motor_back,0);//PWM比例0~255调速
  digitalWrite(Left_motor_go,HIGH);   //左轮后退
  digitalWrite(Left_motor_back,LOW);
  analogWrite(Left_motor_go,200); 
  analogWrite(Left_motor_back,0);//PWM比例0~255调速
  delay(time * 100);	//执行时间，可以调整  
}



void right(float time)        //右转(右轮后退，左轮前进)
{
  digitalWrite(Right_motor_go,LOW);   //右电机后退
  digitalWrite(Right_motor_back,HIGH);
  analogWrite(Right_motor_go,0); 
  analogWrite(Right_motor_back,200);//PWM比例0~255调速
  digitalWrite(Left_motor_go,LOW);//左电机前进
  digitalWrite(Left_motor_back,HIGH);
  analogWrite(Left_motor_go,0); 
  analogWrite(Left_motor_back,200);//PWM比例0~255调速
  delay(time * 100);	//执行时间，可以调整  
}




void back(int time)          //后退
{
  digitalWrite(Right_motor_go,LOW);  //右轮后退
  digitalWrite(Right_motor_back,HIGH);
  analogWrite(Right_motor_go,0);
  analogWrite(Right_motor_back,150);//PWM比例0~255调速
  digitalWrite(Left_motor_go,HIGH);  //左轮后退
  digitalWrite(Left_motor_back,LOW);
  analogWrite(Left_motor_go,150);
  analogWrite(Left_motor_back,0);//PWM比例0~255调速
  delay(time * 100);     //执行时间，可以调整  
}

void loop()
{
  if(Serial.available()>0)
  {
    now=Serial.read();
    Serial.println(now);
    if(now==9)
    bluetoothstate=!bluetoothstate; //蓝牙状态切换
   }

 if(bluetoothstate)
 {
  motor_run(now);
 }
}
void motor_run(int state)
{
  switch(state)
  {
    case 0:  //停止
    brake(10);
    break;
    case 1:    //  前
    run(10);
    break;

    case 2:  //右前
    right(2.1);  
    brake(2);
    run(10);
    break;
 
    case 3:   // 右
    right(3);
    brake(2);
    run(10);
    break;
    
    case 4:   //右后
    right(4.3);
    brake(2);
    run(10);
    break;
    
    case 5:  // 后
    right(5);
    brake(2);
    run(10);
    break;
    
    case 6:  //左后
    left(4.3);
    brake(2);
    run(10);
    break;
    
    case 7:  //左
    left(3);
    brake(2);
    run(10);
    break;
    
    case 8:  // 左前
    left(2.1);
    brake(2);
    run(10);
    break;
    
  }
}

