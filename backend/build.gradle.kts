plugins {
	java
	id("org.springframework.boot") version "3.0.6"
	id("io.spring.dependency-management") version "1.1.0"
}

group = "me.noahvdaa"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_17

repositories {
	mavenCentral()
	maven("https://repo.papermc.io/repository/maven-public/")
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("io.papermc.hangar:HangarJarScanner:1.0-SNAPSHOT")
}
